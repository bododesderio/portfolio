import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/data/db'

/**
 * Postal webhook receiver.
 * Configure in Postal Web UI → Mail Server → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/postal?token=YOUR_WEBHOOK_SECRET
 * Set POSTAL_WEBHOOK_SECRET in your .env to match.
 *
 * Postal sends events: MessageSent, MessageDelivered, MessageBounced, MessageHeld, MessageDelayed
 */
export async function POST(req: NextRequest) {
  // Verify webhook token
  const token = req.nextUrl.searchParams.get('token')
  const secret = process.env.POSTAL_WEBHOOK_SECRET
  const tokenBuffer = Buffer.from(token || '')
  const secretBuffer = Buffer.from(secret || '')
  if (!secret || !token || tokenBuffer.length !== secretBuffer.length || !timingSafeEqual(tokenBuffer, secretBuffer)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

      default:
        console.log(`[Postal Webhook] Unhandled event: ${event}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Postal Webhook] Error:', err)
    // Always return 200 so Postal doesn't retry indefinitely
    return NextResponse.json({ ok: true })
  }
}
