import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendEmail } from '@/lib/resend'
import { renderAdminNotification, renderContactAutoReply } from '@/lib/emails'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = schema.parse(body)

    await prisma.message.create({ data: { name, email, subject, body: message } })

    const adminEmail = process.env.ADMIN_EMAIL!

    const [adminHtml, autoReplyHtml] = await Promise.all([
      renderAdminNotification({ name, email, subject, message }),
      renderContactAutoReply(name),
    ])

    await Promise.allSettled([
      sendEmail({ to: adminEmail, subject: `New message: ${subject}`, html: adminHtml }),
      sendEmail({ to: email, subject: 'Got your message.', html: autoReplyHtml }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
