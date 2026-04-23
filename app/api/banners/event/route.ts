import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { bannerEventSchema } from '@/lib/banners'

/**
 * Public event endpoint — increments impression / click / dismiss / conversion
 * counters on a banner row. No PII stored. Idempotent per event-type (clients
 * only fire once per page load via orchestrator throttling).
 */
export async function POST(req: NextRequest) {
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

    return NextResponse.json({ ok: true })
  } catch {
    // Silent — analytics failures must never break the page.
    return NextResponse.json({ ok: true })
  }
}
