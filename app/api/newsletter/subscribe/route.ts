import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendEmail } from '@/lib/resend'
import { renderWelcomeEmail } from '@/lib/emails'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { unsubscribeUrl } from '@/lib/unsubscribe'

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { ok } = rateLimit(`subscribe:${ip}`, { limit: 5, windowMs: 3600_000 })
  if (!ok) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })

  try {
    const body = await req.json()
    const { email, name } = schema.parse(body)

    const existing = await prisma.subscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed.' })
    }

    await prisma.subscriber.create({ data: { email, name, confirmed: true } })

    const html = await renderWelcomeEmail(name, unsubscribeUrl(email))
    await sendEmail({
      to: email,
      subject: "Welcome — you're in the loop.",
      html,
    }).catch(() => null)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
