import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderConfirmSubscription } from '@/lib/emails'
import { rateLimit, getClientIp } from '@/lib/util/rate-limit'
import { confirmUrl } from '@/lib/domain/confirm-subscribe'

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email().max(254)),
  name: z.string().trim().max(120).optional(),
})

async function sendConfirmation(email: string, name: string | undefined) {
  const html = await renderConfirmSubscription(name, confirmUrl(email))
  // The EmailLog row records the failure for the admin; the visitor still gets a
  // neutral reply so the endpoint cannot be used to probe the mail setup.
  await sendTrackedEmail({ to: email, subject: 'Confirm your subscription', html, type: 'welcome' }).catch(
    (err) => console.error('[Newsletter] Confirmation email failed:', (err as Error).message),
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { ok } = await rateLimit(`subscribe:${ip}`, {
    limit: 5,
    windowMs: 3600_000,
    onError: 'closed',
  })
  if (!ok) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })

  try {
    const body = await req.json()
    const { email, name } = schema.parse(body)

    // Also limit per target address, independent of source IP. Without this,
    // an attacker rotating IPs can use this endpoint to bomb a victim's inbox
    // with confirmation mail sent from our domain.
    const { ok: targetOk } = await rateLimit(`subscribe:to:${email.toLowerCase()}`, {
      limit: 3,
      windowMs: 86_400_000,
      onError: 'closed',
    })
    // Report success either way: telling the caller which addresses are
    // rate-limited would leak whether an address has been targeted.
    if (!targetOk) {
      return NextResponse.json({ success: true, message: 'Check your email to confirm.' })
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } })

    if (existing && existing.confirmed) {
      return NextResponse.json({ success: true, message: 'Already subscribed.' })
    }

    if (existing) {
      await sendConfirmation(email, existing.name ?? undefined)
      return NextResponse.json({ success: true, message: 'Check your email to confirm.' })
    }

    await prisma.subscriber.create({ data: { email, name, confirmed: false } })
    await sendConfirmation(email, name)

    return NextResponse.json({ success: true, message: 'Check your email to confirm.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
