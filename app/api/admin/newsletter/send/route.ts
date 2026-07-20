import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderNewsletterCampaign } from '@/lib/emails'
import { unsubscribeUrl } from '@/lib/domain/unsubscribe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, body } = await req.json()
    if (!subject || !body) return NextResponse.json({ error: 'Subject and body required.' }, { status: 400 })

    // Idempotency: reject if a campaign with the same subject was sent in the last 60s
    const recent = await prisma.newsletterCampaign.findFirst({
      where: {
        subject,
        status: 'sent',
        sentAt: { gte: new Date(Date.now() - 60_000) },
      },
    })
    if (recent) return NextResponse.json({ error: 'Campaign already sent. Please wait before retrying.' }, { status: 409 })

    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } })
    if (subscribers.length === 0) return NextResponse.json({ error: 'No subscribers.' }, { status: 400 })

    // Create campaign first so we have an ID for email tracking
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject,
        bodyHtml: body,
        status: 'sent',
        sentAt: new Date(),
        recipientCount: subscribers.length,
      },
    })

    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (subscriber) => {
          const html = await renderNewsletterCampaign(subject, body, unsubscribeUrl(subscriber.email))
          return sendTrackedEmail({
            to: subscriber.email,
            subject,
            html,
            type: 'campaign',
            campaignId: campaign.id,
          }).catch((err) => {
            console.error(`[Newsletter] Failed to send to ${subscriber.email}:`, (err as Error).message)
            return null
          })
        })
      )
    }

    return NextResponse.json({ success: true, recipientCount: subscribers.length, campaignId: campaign.id })
  } catch (err) {
    console.error('[Newsletter Send] Error:', err)
    return NextResponse.json({ error: 'Send failed.' }, { status: 500 })
  }
}
