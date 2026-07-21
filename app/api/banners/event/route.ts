import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { bannerEventSchema } from '@/lib/domain/banners'
import { getClientIp, rateLimit } from '@/lib/util/rate-limit'

/**
 * Public event endpoint — increments impression / click / dismiss / conversion
 * counters on a banner row. No PII stored. Idempotent per event-type (clients
 * only fire once per page load via orchestrator throttling).
 *
 * Banner ids are published by /api/banners/active, so these counters are
 * writable by anyone who reads that endpoint. Rate limiting by IP keeps a
 * scripted loop from silently inflating the conversion numbers the site owner
 * makes decisions on. Fails open: analytics must never break the page.
 */
export async function POST(req: NextRequest) {
  const { ok } = await rateLimit(`banner-event:${getClientIp(req)}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!ok) return NextResponse.json({ success: true })

  try {
    const body = await req.json()
    const { id, event } = bannerEventSchema.parse(body)

    const field =
      event === 'impression' ? 'impressionCount' :
      event === 'click'      ? 'clickCount'      :
      event === 'dismiss'    ? 'dismissCount'    :
                               'conversionCount'

    await prisma.banner.update({
      where: { id },
      data: { [field]: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch {
    // Silent — analytics failures must never break the page.
    return NextResponse.json({ success: true })
  }
}
