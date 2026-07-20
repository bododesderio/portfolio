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
  const { ok } = await rateLimit(`subscribe:${ip}`, { limit: 5, windowMs: 3600_000 })
  if (!ok) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })

  try {
    const body = await req.json()
    const { email, name } = schema.parse(body)

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
