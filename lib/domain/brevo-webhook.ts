import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/data/db'

/** One transactional event as Brevo posts it (single or batched). */
export interface BrevoEvent {
  event?: string
  email?: string
  'message-id'?: string
  'X-Mailin-custom'?: string
  reason?: string
  [field: string]: unknown
}

/** Events after which the address must stop receiving the newsletter. */
const SUPPRESSING = new Set(['hard_bounce', 'invalid_email', 'blocked', 'spam', 'unsubscribed'])
const BOUNCED = new Set(['hard_bounce', 'invalid_email', 'blocked'])

/**
 * Brevo also reports opens and clicks, but those are already recorded by the
 * first-party pixel and click tracker; counting both would double the rates.
 */
const IGNORED = new Set(['request', 'opened', 'unique_opened', 'proxy_open', 'unique_proxy_open', 'click'])

async function findLog(event: BrevoEvent) {
  const logId = typeof event['X-Mailin-custom'] === 'string' ? event['X-Mailin-custom'].trim() : ''
  if (logId) {
    const byId = await prisma.emailLog.findUnique({ where: { id: logId } })
    if (byId) return byId
  }
  const messageId = event['message-id']
  return messageId ? prisma.emailLog.findFirst({ where: { providerMsgId: messageId } }) : null
}

export type BrevoOutcome = 'ignored' | 'unmatched' | 'recorded'

export async function applyBrevoEvent(event: BrevoEvent): Promise<BrevoOutcome> {
  const name = event.event ?? ''
  if (!name || IGNORED.has(name)) return 'ignored'

  if (SUPPRESSING.has(name) && event.email) {
    await prisma.subscriber.updateMany({
      where: { email: event.email.trim().toLowerCase() },
      data: { confirmed: false },
    })
  }

  const log = await findLog(event)
  if (!log) return 'unmatched'

  const now = new Date()
  const metadata = event as Prisma.InputJsonValue
  const reason = typeof event.reason === 'string' && event.reason ? event.reason : name

  if (name === 'delivered') {
    // Brevo retries webhooks, so only the first delivery moves the counters.
    const { count } = await prisma.emailLog.updateMany({
      where: { id: log.id, status: 'sent' },
      data: { status: 'delivered', deliveredAt: now },
    })
    await prisma.emailEvent.create({ data: { emailLogId: log.id, event: 'delivered', metadata } })
    if (count && log.campaignId) {
      await prisma.newsletterCampaign.update({
        where: { id: log.campaignId },
        data: { deliveredCount: { increment: 1 } },
      })
    }
    return 'recorded'
  }

  if (BOUNCED.has(name)) {
    const { count } = await prisma.emailLog.updateMany({
      where: { id: log.id, status: { not: 'bounced' } },
      data: { status: 'bounced', bouncedAt: now, failReason: reason },
    })
    await prisma.emailEvent.create({ data: { emailLogId: log.id, event: 'bounced', metadata } })
    if (count && log.campaignId) {
      await prisma.newsletterCampaign.update({
        where: { id: log.campaignId },
        data: { bounceCount: { increment: 1 } },
      })
    }
    return 'recorded'
  }

  if (name === 'error') {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'failed', failReason: reason },
    })
    await prisma.emailEvent.create({ data: { emailLogId: log.id, event: 'failed', metadata } })
    return 'recorded'
  }

  // soft_bounce, deferred, spam and unsubscribed are kept as history on the log.
  await prisma.emailEvent.create({ data: { emailLogId: log.id, event: name, metadata } })
  return 'recorded'
}
