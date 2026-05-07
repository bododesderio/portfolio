import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Postal webhook receiver.
 * Configure in Postal Web UI → Mail Server → Webhooks → URL: https://yourdomain.com/api/webhooks/postal
 *
 * Postal sends events: MessageSent, MessageDelivered, MessageBounced, MessageHeld, MessageDelayed
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const event = payload.event
    const msgId = payload.payload?.message?.id?.toString()
    const originalId = payload.payload?.original_message?.id?.toString()

    // Find the email log by Postal message ID
    const postalId = msgId || originalId
    if (!postalId) return NextResponse.json({ ok: true })

    const log = await prisma.emailLog.findFirst({
      where: { postalMsgId: postalId },
    })

    if (!log) return NextResponse.json({ ok: true })

    const now = new Date()

    switch (event) {
      case 'MessageDelivered': {
        await Promise.all([
          prisma.emailLog.update({
            where: { id: log.id },
            data: { status: 'delivered', deliveredAt: now },
          }),
          prisma.emailEvent.create({
            data: {
              emailLogId: log.id,
              event: 'delivered',
              metadata: payload.payload ?? undefined,
            },
          }),
          log.campaignId
            ? prisma.newsletterCampaign.update({
                where: { id: log.campaignId },
                data: { deliveredCount: { increment: 1 } },
              })
            : null,
        ])
        break
      }

      case 'MessageBounced': {
        const bounceMsg = payload.payload?.bounce?.message ?? 'Bounced'
        await Promise.all([
          prisma.emailLog.update({
            where: { id: log.id },
            data: { status: 'bounced', bouncedAt: now, failReason: bounceMsg },
          }),
          prisma.emailEvent.create({
            data: {
              emailLogId: log.id,
              event: 'bounced',
              metadata: payload.payload ?? undefined,
            },
          }),
          log.campaignId
            ? prisma.newsletterCampaign.update({
                where: { id: log.campaignId },
                data: { bounceCount: { increment: 1 } },
              })
            : null,
        ])
        break
      }

      case 'MessageHeld': {
        await Promise.all([
          prisma.emailLog.update({
            where: { id: log.id },
            data: { status: 'failed', failReason: 'Message held by Postal' },
          }),
          prisma.emailEvent.create({
            data: {
              emailLogId: log.id,
              event: 'held',
              metadata: payload.payload ?? undefined,
            },
          }),
        ])
        break
      }

      case 'MessageDelayed': {
        await prisma.emailEvent.create({
          data: {
            emailLogId: log.id,
            event: 'delayed',
            metadata: payload.payload ?? undefined,
          },
        })
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Always return 200 so Postal doesn't retry indefinitely
    return NextResponse.json({ ok: true })
  }
}
