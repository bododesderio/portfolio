import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { countWithDelta, topPages } from '@/lib/analytics'
import { sendTrackedEmail } from '@/lib/email-tracking'
import { renderAnalyticsDigest } from '@/lib/emails'
import { getConfig } from '@/lib/config'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const days = 7

  const [viewStats, top, newSubs, newMsgs] = await Promise.all([
    countWithDelta(days),
    topPages(days, 5),
    prisma.subscriber.count({
      where: {
        subscribedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        confirmed: true,
      },
    }),
    prisma.message.count({
      where: {
        receivedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const html = await renderAnalyticsDigest({
    views: viewStats.current,
    viewsDelta: viewStats.delta,
    topPages: top,
    newSubscribers: newSubs,
    newMessages: newMsgs,
    periodDays: days,
  })

  const adminEmail = await getConfig('ADMIN_EMAIL')

  try {
    await sendTrackedEmail({
      to: adminEmail,
      subject: `Weekly Digest — ${viewStats.current} views, ${newSubs} new subscribers`,
      html,
      type: 'digest',
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Email send failed',
      details: err instanceof Error ? err.message : 'Unknown error',
      stats: { views: viewStats.current, delta: viewStats.delta, newSubscribers: newSubs, newMessages: newMsgs },
    }, { status: 500 })
  }

  return NextResponse.json({
    sent: true,
    to: adminEmail,
    stats: {
      views: viewStats.current,
      delta: viewStats.delta,
      topPages: top,
      newSubscribers: newSubs,
      newMessages: newMsgs,
    },
  })
}
