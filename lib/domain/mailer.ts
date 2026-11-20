import nodemailer from 'nodemailer'
import { getConfig } from '@/lib/config'

let _transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (_transporter) return _transporter

  const host = await getConfig('SMTP_HOST')
  if (!host) throw new Error('SMTP is not configured: set SMTP_HOST in Settings > Integrations.')
  const port = Number(await getConfig('SMTP_PORT')) || 587
  const user = await getConfig('SMTP_USER')
  const pass = await getConfig('SMTP_PASS')

  // A pool keeps a newsletter batch on a handful of reused connections instead
  // of one TLS handshake per recipient, which relays like Brevo throttle.
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 5,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })

  return _transporter
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  headers?: Record<string, string>
  attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

export async function sendEmail({ to, subject, html, text, from, replyTo, headers, attachments }: EmailOptions) {
  const transporter = await getTransporter()
  const sender = from || (await getConfig('SMTP_FROM'))
  if (!sender) throw new Error('SMTP_FROM is not set: add a verified sender in Settings > Integrations.')
  const recipients = Array.isArray(to) ? to.join(', ') : to
  return transporter.sendMail({ from: sender, to: recipients, subject, html, text, replyTo, headers, attachments })
}

/** Drops the cached transporter so the next send picks up changed SMTP settings. */
export function resetTransporter() {
  _transporter?.close()
  _transporter = null
}
