import type { InboundEmail, Prisma } from '@prisma/client'
import { prisma } from '@/lib/data/db'
import { sendEmail } from '@/lib/domain/mailer'
import { formatSender, senderDomain, senderFor } from '@/lib/domain/senders'

const ATTACHMENT_URL = 'https://api.brevo.com/v3/inbound/attachments/'
// Gmail rejects messages over 25 MB; leave room for the encoded bodies.
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024
// Brevo's rspamd score at which a message is kept but not forwarded.
const SPAM_THRESHOLD = 10

interface Mailbox {
  Name?: string | null
  Address?: string | null
}

interface InboundAttachment {
  Name?: string
  ContentType?: string
  ContentLength?: number
  DownloadToken?: string
}

/** One parsed message from Brevo's inboundEmailProcessed payload (`items[]`). */
export interface BrevoInboundItem {
  Uuid?: string[] | string
  MessageId?: string
  From?: Mailbox
  To?: Mailbox[]
  ReplyTo?: Mailbox | null
  Recipients?: string[]
  Subject?: string
  RawHtmlBody?: string | null
  RawTextBody?: string | null
  Attachments?: InboundAttachment[]
  SpamScore?: number
  Spam?: { Score?: number }
}

function mailbox(entry: Mailbox | null | undefined) {
  return {
    address: (entry?.Address ?? '').trim().toLowerCase(),
    name: (entry?.Name ?? '').trim(),
  }
}

/** Saves one message; a Brevo retry of the same message returns the stored row. */
export async function storeInbound(item: BrevoInboundItem): Promise<InboundEmail> {
  const from = mailbox(item.From)
  const uuid = Array.isArray(item.Uuid) ? item.Uuid[0] : item.Uuid
  const messageId = (item.MessageId ?? '').trim().slice(0, 255) || `brevo-${uuid ?? Date.now()}`
  const recipients = (item.Recipients?.length ? item.Recipients : (item.To ?? []).map((to) => mailbox(to).address))
    .map((address) => String(address).toLowerCase())
    .filter(Boolean)
    .slice(0, 50)
  const score = item.Spam?.Score ?? item.SpamScore
  const attachments = (item.Attachments ?? []).map((a) => ({
    Name: a.Name ?? 'attachment',
    ContentType: a.ContentType ?? 'application/octet-stream',
    ContentLength: Number(a.ContentLength) || 0,
    DownloadToken: a.DownloadToken ?? '',
  }))

  return prisma.inboundEmail.upsert({
    where: { messageId },
    update: {},
    create: {
      messageId,
      fromAddress: from.address || 'unknown@invalid',
      fromName: from.name.slice(0, 200),
      replyTo: mailbox(item.ReplyTo).address || null,
      recipients,
      subject: (item.Subject ?? '').slice(0, 500),
      textBody: item.RawTextBody ?? '',
      htmlBody: item.RawHtmlBody ?? '',
      attachments: attachments as Prisma.InputJsonValue,
      spamScore: typeof score === 'number' ? score : null,
    },
  })
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

function summaryHtml(row: InboundEmail) {
  const sender = escapeHtml(formatSender(row.fromName, row.fromAddress))
  const to = escapeHtml(row.recipients.join(', '))
  const received = row.receivedAt.toLocaleString('en-GB', { timeZone: 'Africa/Kampala' })
  return (
    '<div style="font-family:Arial,sans-serif;font-size:12px;color:#4b5a50;border-left:3px solid #c9a84c;' +
    'padding:8px 12px;margin:0 0 16px;background:#f4f1e8">' +
    `<strong>From:</strong> ${sender}<br><strong>To:</strong> ${to}<br><strong>Received:</strong> ${received} (Kampala)` +
    '</div>'
  )
}

async function downloadAttachment(token: string): Promise<Buffer | null> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey || !token) return null
  const res = await fetch(ATTACHMENT_URL + encodeURIComponent(token), {
    headers: { 'api-key': apiKey },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Brevo attachment download failed (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

export type ForwardOutcome = { forwarded: true } | { forwarded: false; reason: string }

/**
 * Sends a stored message to the forwarding inbox from the no-reply sender (the
 * relay only signs our own domain), with Reply-To set to the original sender
 * so answering from Gmail goes straight back to them. Throws on SMTP failure
 * so the webhook can ask Brevo to retry.
 */
export async function forwardInbound(row: InboundEmail): Promise<ForwardOutcome> {
  if (row.forwardedAt) return { forwarded: true }
  const to = (process.env.INBOUND_FORWARD_TO ?? '').trim()
  let reason = ''
  if (!to) reason = 'INBOUND_FORWARD_TO is not set'
  else if (row.spamScore !== null && row.spamScore >= SPAM_THRESHOLD) reason = `held as spam (score ${row.spamScore})`
  else if (row.fromAddress.endsWith(`@${await senderDomain()}`)) reason = 'sent from our own domain; not forwarded to avoid a loop'
  if (reason) {
    await prisma.inboundEmail.update({ where: { id: row.id }, data: { forwardError: reason } })
    return { forwarded: false, reason }
  }

  const attachments: { filename: string; content: Buffer; contentType?: string }[] = []
  const skipped: string[] = []
  let total = 0
  for (const att of row.attachments as unknown as InboundAttachment[]) {
    const name = att.Name || 'attachment'
    if (total + (att.ContentLength ?? 0) > MAX_ATTACHMENT_BYTES) {
      skipped.push(name)
      continue
    }
    try {
      const content = await downloadAttachment(att.DownloadToken ?? '')
      if (!content) {
        skipped.push(name)
        continue
      }
      total += content.length
      attachments.push({ filename: name, content, contentType: att.ContentType })
    } catch (err) {
      console.warn(`[Inbound] Attachment ${name} on ${row.id} not downloaded:`, (err as Error).message)
      skipped.push(name)
    }
  }

  const header = `From: ${formatSender(row.fromName, row.fromAddress)}\nTo: ${row.recipients.join(', ')}\n\n`
  const note = skipped.length ? `\n\n[Not attached: ${skipped.join(', ')}. Open the message in the Brevo inbound log.]` : ''
  const html = row.htmlBody
    ? summaryHtml(row) + row.htmlBody + (note ? `<p>${escapeHtml(note.trim())}</p>` : '')
    : summaryHtml(row) + `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(row.textBody)}</pre>`

  const domain = await senderDomain()
  await sendEmail({
    to,
    subject: row.subject || '(no subject)',
    html,
    text: header + row.textBody + note,
    from: await senderFor('inbound_forward', `${row.fromName || row.fromAddress} via ${domain}`),
    replyTo: row.replyTo || row.fromAddress,
    headers: { 'X-Bodo-Inbound-To': row.recipients.join(', ').slice(0, 500) },
    attachments,
  })

  await prisma.inboundEmail.update({
    where: { id: row.id },
    data: { forwardedTo: to, forwardedAt: new Date(), forwardError: null },
  })
  return { forwarded: true }
}
