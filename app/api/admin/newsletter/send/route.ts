import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { resend } from '@/lib/resend'
import { renderNewsletterCampaign } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, body } = await req.json()
    if (!subject || !body) return NextResponse.json({ error: 'Subject and body required.' }, { status: 400 })

    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } })
    if (subscribers.length === 0) return NextResponse.json({ error: 'No subscribers.' }, { status: 400 })

    const from = process.env.ADMIN_EMAIL!
    const html = await renderNewsletterCampaign(subject, body)
    const batchSize = 50

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      await resend.emails.send({
        from,
        to: batch.map(s => s.email),
        subject,
        html,
      })
    }

    await prisma.newsletterCampaign.create({
      data: {
        subject,
        bodyHtml: body,
        status: 'sent',
        sentAt: new Date(),
        recipientCount: subscribers.length,
      },
    })

    return NextResponse.json({ success: true, recipientCount: subscribers.length })
  } catch {
    return NextResponse.json({ error: 'Send failed.' }, { status: 500 })
  }
}
