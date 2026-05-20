import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendTrackedEmail } from '@/lib/email-tracking'
import { renderAdminNotification, renderContactAutoReply } from '@/lib/emails'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getConfig } from '@/lib/config'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { ok } = await rateLimit(`contact:${ip}`, { limit: 5, windowMs: 3600_000 })
  if (!ok) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })

  try {
    const body = await req.json()
    const { name, email, subject, message } = schema.parse(body)

    await prisma.message.create({ data: { name, email, subject, body: message } })

    const adminEmail = await getConfig('ADMIN_EMAIL')
    if (!adminEmail) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const [adminHtml, autoReplyHtml] = await Promise.all([
      renderAdminNotification({ name, email, subject, message }),
      renderContactAutoReply(name),
    ])

    await Promise.allSettled([
      sendTrackedEmail({ to: adminEmail, subject: `New message: ${subject}`, html: adminHtml, type: 'admin_notify' }),
      sendTrackedEmail({ to: email, subject: 'Got your message.', html: autoReplyHtml, type: 'contact_reply' }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
