import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/data/db', () => ({
  prisma: {
    emailLog: { findUnique: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    emailEvent: { create: vi.fn() },
    newsletterCampaign: { update: vi.fn() },
    subscriber: { updateMany: vi.fn() },
  },
}))

import { applyBrevoEvent } from '../lib/domain/brevo-webhook'
import { prisma } from '../lib/data/db'

const log = { id: 'log_1', campaignId: 'camp_1', status: 'sent' }
const db = vi.mocked(prisma, { deep: true })

describe('applyBrevoEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    db.emailLog.findUnique.mockResolvedValue(log as never)
    db.emailLog.updateMany.mockResolvedValue({ count: 1 })
  })

  it('matches the log through X-Mailin-custom and counts the first delivery', async () => {
    const outcome = await applyBrevoEvent({ event: 'delivered', email: 'a@b.co', 'X-Mailin-custom': 'log_1' })
    expect(outcome).toBe('recorded')
    expect(db.emailLog.findUnique).toHaveBeenCalledWith({ where: { id: 'log_1' } })
    expect(db.emailLog.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'log_1', status: 'sent' } }),
    )
    expect(db.newsletterCampaign.update).toHaveBeenCalledWith({
      where: { id: 'camp_1' },
      data: { deliveredCount: { increment: 1 } },
    })
  })

  it('does not count a retried delivery twice', async () => {
    db.emailLog.updateMany.mockResolvedValue({ count: 0 })
    await applyBrevoEvent({ event: 'delivered', 'X-Mailin-custom': 'log_1' })
    expect(db.newsletterCampaign.update).not.toHaveBeenCalled()
    expect(db.emailEvent.create).toHaveBeenCalledOnce()
  })

  it('marks a hard bounce, counts it, and stops mailing the address', async () => {
    await applyBrevoEvent({
      event: 'hard_bounce',
      email: ' Reader@Example.com ',
      reason: 'mailbox does not exist',
      'X-Mailin-custom': 'log_1',
    })
    expect(db.subscriber.updateMany).toHaveBeenCalledWith({
      where: { email: 'reader@example.com' },
      data: { confirmed: false },
    })
    expect(db.emailLog.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'bounced', failReason: 'mailbox does not exist' }),
      }),
    )
    expect(db.newsletterCampaign.update).toHaveBeenCalledWith({
      where: { id: 'camp_1' },
      data: { bounceCount: { increment: 1 } },
    })
  })

  it('unsubscribes on a spam complaint without marking a bounce', async () => {
    await applyBrevoEvent({ event: 'spam', email: 'x@y.co', 'X-Mailin-custom': 'log_1' })
    expect(db.subscriber.updateMany).toHaveBeenCalledOnce()
    expect(db.emailLog.updateMany).not.toHaveBeenCalled()
    expect(db.emailEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ event: 'spam' }) }),
    )
  })

  it('falls back to the relay message id when the custom header is missing', async () => {
    db.emailLog.findFirst.mockResolvedValue(log as never)
    await applyBrevoEvent({ event: 'soft_bounce', 'message-id': '<abc@relay>' })
    expect(db.emailLog.findFirst).toHaveBeenCalledWith({ where: { providerMsgId: '<abc@relay>' } })
    expect(db.subscriber.updateMany).not.toHaveBeenCalled()
  })

  it('ignores opens and clicks, which first-party tracking already records', async () => {
    expect(await applyBrevoEvent({ event: 'opened', 'X-Mailin-custom': 'log_1' })).toBe('ignored')
    expect(await applyBrevoEvent({ event: 'click', 'X-Mailin-custom': 'log_1' })).toBe('ignored')
    expect(db.emailLog.findUnique).not.toHaveBeenCalled()
  })

  it('reports unmatched events without writing anything', async () => {
    db.emailLog.findUnique.mockResolvedValue(null)
    expect(await applyBrevoEvent({ event: 'delivered', 'X-Mailin-custom': 'gone' })).toBe('unmatched')
    expect(db.emailEvent.create).not.toHaveBeenCalled()
  })
})
