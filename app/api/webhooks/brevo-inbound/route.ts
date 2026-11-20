import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/data/db'
import { forwardInbound, storeInbound, type BrevoInboundItem } from '@/lib/domain/inbound-email'

/**
 * Brevo inbound parsing: mail to any @bododesderio.com address (MX points at
 * inbound1/2.sendinblue.com) arrives here as parsed JSON.
 * URL: https://bododesderio.com/api/webhooks/brevo-inbound?token=<EMAIL_WEBHOOK_SECRET>
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.EMAIL_WEBHOOK_SECRET
  const supplied = req.nextUrl.searchParams.get('token') ?? ''
  if (!secret) return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: { items?: BrevoInboundItem[] }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let failed = 0
  for (const item of payload.items ?? []) {
    const row = await storeInbound(item)
    try {
      const outcome = await forwardInbound(row)
      if (!outcome.forwarded) console.warn(`[Inbound] ${row.id} kept, not forwarded: ${outcome.reason}`)
    } catch (err) {
      failed += 1
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[Inbound] Forwarding ${row.id} failed:`, message)
      await prisma.inboundEmail.update({ where: { id: row.id }, data: { forwardError: message.slice(0, 500) } })
    }
  }

  // A 500 makes Brevo redeliver; stored rows are reused and only unforwarded ones are sent again.
  if (failed) return NextResponse.json({ error: `${failed} message(s) not forwarded` }, { status: 500 })
  return NextResponse.json({ ok: true })
}
