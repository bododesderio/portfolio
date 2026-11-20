import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/config', () => ({ getConfig: vi.fn() }))
vi.mock('../lib/domain/mailer', () => ({ sendEmail: vi.fn() }))
vi.mock('../lib/data/db', () => ({
  prisma: { inboundEmail: { upsert: vi.fn(), update: vi.fn() } },
}))

import { getConfig } from '../lib/config'
import { sendEmail } from '../lib/domain/mailer'
import { prisma } from '../lib/data/db'
import { parseSender, senderFor } from '../lib/domain/senders'
import { forwardInbound, storeInbound } from '../lib/domain/inbound-email'

const config = vi.mocked(getConfig)
const send = vi.mocked(sendEmail)
const db = vi.mocked(prisma, { deep: true })

const row = {
  id: 'in_1',
  messageId: '<m1@gmail.com>',
  fromAddress: 'reader@gmail.com',
  fromName: 'A Reader',
  replyTo: null,
  recipients: ['info@bododesderio.com'],
  subject: 'Hello',
  textBody: 'Hi Bodo',
  htmlBody: '',
  attachments: [],
  spamScore: 1.2,
  forwardedTo: null,
  forwardedAt: null,
  forwardError: null,
  receivedAt: new Date('2026-11-20T10:00:00Z'),
}

beforeEach(() => {
  vi.clearAllMocks()
  config.mockImplementation(async (key: string) =>
    key === 'SMTP_FROM' ? 'Bodo Desderio <info@bododesderio.com>' : '',
  )
  process.env.INBOUND_FORWARD_TO = 'owner@gmail.com'
})

describe('senderFor', () => {
  it('sends newsletters from news@, contact replies from work@ and admin mail from no-reply@', async () => {
    expect(await senderFor('campaign')).toBe('Bodo Desderio <news@bododesderio.com>')
    expect(await senderFor('welcome')).toBe('Bodo Desderio <news@bododesderio.com>')
    expect(await senderFor('contact_reply')).toBe('Bodo Desderio <work@bododesderio.com>')
    expect(await senderFor('admin_notify')).toBe('Bodo Desderio <no-reply@bododesderio.com>')
  })

  it('falls back to SMTP_FROM for an unmapped type', async () => {
    expect(await senderFor('something_else')).toBe('Bodo Desderio <info@bododesderio.com>')
  })

  it('parses bare and named addresses', () => {
    expect(parseSender('x@y.com')).toEqual({ name: '', address: 'x@y.com' })
    expect(parseSender('"Bodo D" <x@y.com>')).toEqual({ name: 'Bodo D', address: 'x@y.com' })
  })
})

describe('inbound mail', () => {
  it('stores a message keyed by its Message-ID with lowercased recipients', async () => {
    db.inboundEmail.upsert.mockResolvedValue(row as never)
    await storeInbound({
      MessageId: '<m1@gmail.com>',
      From: { Name: 'A Reader', Address: 'Reader@Gmail.com' },
      Recipients: ['Info@BodoDesderio.com'],
      Subject: 'Hello',
      RawTextBody: 'Hi Bodo',
      SpamScore: 1.2,
    })
    const call = db.inboundEmail.upsert.mock.calls[0][0]
    expect(call.where).toEqual({ messageId: '<m1@gmail.com>' })
    expect(call.create).toMatchObject({ fromAddress: 'reader@gmail.com', recipients: ['info@bododesderio.com'] })
  })

  it('forwards from no-reply@ with Reply-To set to the original sender', async () => {
    await forwardInbound(row as never)
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@gmail.com',
        from: 'A Reader via bododesderio.com <no-reply@bododesderio.com>',
        replyTo: 'reader@gmail.com',
        subject: 'Hello',
      }),
    )
    expect(db.inboundEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ forwardedTo: 'owner@gmail.com' }) }),
    )
  })

  it('holds spam and mail from our own domain instead of forwarding it', async () => {
    expect(await forwardInbound({ ...row, spamScore: 12 } as never)).toMatchObject({ forwarded: false })
    expect(
      await forwardInbound({ ...row, fromAddress: 'news@bododesderio.com' } as never),
    ).toMatchObject({ forwarded: false })
    expect(send).not.toHaveBeenCalled()
  })

  it('does not forward a message twice', async () => {
    await forwardInbound({ ...row, forwardedAt: new Date() } as never)
    expect(send).not.toHaveBeenCalled()
  })
})
