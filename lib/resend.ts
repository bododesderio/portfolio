import { Resend } from 'resend'
import { getConfig } from './config'

async function getResend() {
  const apiKey = await getConfig('RESEND_API_KEY')
  return new Resend(apiKey)
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const client = await getResend()
  const sender = from ?? (await getConfig('ADMIN_EMAIL'))
  return client.emails.send({ from: sender, to, subject, html })
}

export async function getResendClient() {
  return getResend()
}

// Legacy named export for compatibility
export const resend = { emails: { send: async (opts: Parameters<Resend['emails']['send']>[0]) => (await getResend()).emails.send(opts) } }
