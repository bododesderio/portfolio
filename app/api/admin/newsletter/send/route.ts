import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderNewsletterCampaign } from '@/lib/emails'
import { unsubscribeUrl } from '@/lib/domain/unsubscribe'

const schema = z.object({
  subject: z.string().min(1).max(300),
  body: z.string().min(1),
})

// Rendered once per campaign rather than once per subscriber; only the
// unsubscribe link varies, so it is substituted in per recipient.
const UNSUBSCRIBE_PLACEHOLDER = 'https://unsubscribe.placeholder.invalid/__RECIPIENT__'

const BATCH_SIZE = 50

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, body } = schema.parse(await req.json())

    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } })
    if (subscribers.length === 0) return NextResponse.json({ error: 'No subscribers.' }, { status: 400 })

    // Resume a campaign interrupted mid-send rather than starting a second one.
    // Previously the row was written as 'sent' with the full recipient count
    // *before* any mail went out, so a timeout left it claiming a completed
    // send; retrying after the 60s window then re-delivered to everyone who had
    // already received it.
    const inFlight = await prisma.newsletterCampaign.findFirst({
      where: { subject, status: 'sending' },
      orderBy: { createdAt: 'desc' },
    })

    const alreadySent = await prisma.newsletterCampaign.findFirst({
      where: {
        subject,
        status: 'sent',
        sentAt: { gte: new Date(Date.now() - 60_000) },
      },
    })
    if (alreadySent) {
      return NextResponse.json(
        { error: 'Campaign already sent. Please wait before retrying.' },
        { status: 409 },
      )
    }

    const campaign =
      inFlight ??
      (await prisma.newsletterCampaign.create({
        data: {
          subject,
          bodyHtml: body,
          // Stays 'sending' until every batch completes, so the row never
          // overstates what was actually delivered.
          status: 'sending',
          sentAt: new Date(),
          recipientCount: subscribers.length,
        },
      }))

    // Recipients that already have an EmailLog for this campaign were reached on
    // a previous attempt. sendTrackedEmail writes that row, so it doubles as the
    // per-recipient progress ledger — no extra table needed.
    const delivered = await prisma.emailLog.findMany({
      where: { campaignId: campaign.id, status: { not: 'failed' } },
      select: { to: true },
    })
    const deliveredTo = new Set(delivered.map((log) => log.to))
    const pending = subscribers.filter((s) => !deliveredTo.has(s.email))

    if (pending.length === 0) {
      await prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: { status: 'sent' },
      })
      return NextResponse.json({
        success: true,
        campaignId: campaign.id,
        recipientCount: subscribers.length,
        sent: 0,
        skipped: subscribers.length,
      })
    }

    const template = await renderNewsletterCampaign(subject, body, UNSUBSCRIBE_PLACEHOLDER)

    let sent = 0
    let failed = 0

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((subscriber) =>
          sendTrackedEmail({
            to: subscriber.email,
            subject,
            html: template.split(UNSUBSCRIBE_PLACEHOLDER).join(unsubscribeUrl(subscriber.email)),
            type: 'campaign',
            campaignId: campaign.id,
          })
            .then(() => true)
            .catch((err) => {
              console.error(
                `[Newsletter] Failed to send to ${subscriber.email}:`,
                (err as Error).message,
              )
              return false
            }),
        ),
      )
      sent += results.filter(Boolean).length
      failed += results.filter((r) => !r).length
    }

    await prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: { status: 'sent' },
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      recipientCount: subscribers.length,
      sent,
      failed,
      skipped: subscribers.length - pending.length,
      resumed: Boolean(inFlight),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    console.error('[Newsletter Send] Error:', err)
    return NextResponse.json({ error: 'Send failed.' }, { status: 500 })
  }
}
