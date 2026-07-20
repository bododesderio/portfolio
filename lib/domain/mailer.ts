import nodemailer from 'nodemailer'
import { getConfig } from '@/lib/config'

let _transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (_transporter) return _transporter

  const host = await getConfig('SMTP_HOST')
  const port = Number(await getConfig('SMTP_PORT')) || 587
  const user = await getConfig('SMTP_USER')
  const pass = await getConfig('SMTP_PASS')
  const secure = port === 465

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })

  return _transporter
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const transporter = await getTransporter()
  const sender = from ?? (await getConfig('SMTP_FROM'))
  const recipients = Array.isArray(to) ? to.join(', ') : to
  return transporter.sendMail({ from: sender, to: recipients, subject, html })
}

// Reset cached transporter (useful if config changes at runtime)
export function resetTransporter() {
  _transporter = null
}
