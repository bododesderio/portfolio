import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderConfirmSubscription } from '@/lib/emails'
import { rateLimit, getClientIp } from '@/lib/util/rate-limit'
import { confirmUrl } from '@/lib/domain/confirm-subscribe'

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

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

    if (existing && !existing.confirmed) {
      // Resend confirmation email
      const url = confirmUrl(email)
      const html = await renderConfirmSubscription(existing.name ?? undefined, url)
      await sendTrackedEmail({
        to: email,
        subject: 'Confirm your subscription',
        html,
        type: 'welcome',
      }).catch(() => null)

      return NextResponse.json({ success: true, message: 'Check your email to confirm.' })
    }

    await prisma.subscriber.create({ data: { email, name, confirmed: false } })

    const url = confirmUrl(email)
    const html = await renderConfirmSubscription(name, url)
    await sendTrackedEmail({
      to: email,
      subject: 'Confirm your subscription',
      html,
      type: 'welcome',
    }).catch(() => null)

    return NextResponse.json({ success: true, message: 'Check your email to confirm.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
