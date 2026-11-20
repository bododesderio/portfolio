import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { applyBrevoEvent, type BrevoEvent } from '@/lib/domain/brevo-webhook'

/**
 * Brevo transactional webhook (Transactional > Settings > Webhook).
 * URL: https://bododesderio.com/api/webhooks/brevo?token=<EMAIL_WEBHOOK_SECRET>
 * or the bare URL with Brevo's "Bearer token" authentication set to the secret.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.EMAIL_WEBHOOK_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization') ?? ''
  const supplied = header.startsWith('Bearer ')
    ? header.slice(7).trim()
    : req.nextUrl.searchParams.get('token') ?? ''
  const a = Buffer.from(supplied)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const events = (Array.isArray(body) ? body : [body]).filter(
    (entry): entry is BrevoEvent => typeof entry === 'object' && entry !== null,
  )

  try {
    for (const event of events) await applyBrevoEvent(event)
  } catch (err) {
    // A 500 makes Brevo retry, which is what we want for a transient database error.
    console.error('[Brevo webhook] Failed to record event:', err)
    return NextResponse.json({ error: 'Not recorded' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
