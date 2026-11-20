import { getConfig } from '@/lib/config'

/**
 * Which verified Brevo sender each kind of email goes out from. The domain and
 * display name come from SMTP_FROM, so only the mailbox part is fixed here.
 * Every one of these addresses also receives mail (see inbound-email.ts).
 */
const MAILBOX_BY_TYPE: Record<string, string> = {
  campaign: 'news',
  welcome: 'news',
  new_post: 'news',
  contact_reply: 'work',
  admin_notify: 'no-reply',
  digest: 'no-reply',
  inbound_forward: 'no-reply',
}

/** Splits `Name <local@domain>` (or a bare address) into its parts. */
export function parseSender(value: string): { name: string; address: string } {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1].trim(), address: match[2].trim() }
  return { name: '', address: value.trim() }
}

export function formatSender(name: string, address: string): string {
  if (!name) return address
  const quoted = /[",<>@]/.test(name) ? `"${name.replace(/"/g, "'")}"` : name
  return `${quoted} <${address}>`
}

export async function senderFor(type: string, displayName?: string): Promise<string> {
  const base = await getConfig('SMTP_FROM')
  if (!base) return ''
  const { name, address } = parseSender(base)
  const domain = address.split('@')[1]
  const mailbox = MAILBOX_BY_TYPE[type]
  const chosen = mailbox && domain ? `${mailbox}@${domain}` : address
  return formatSender(displayName ?? name, chosen)
}

/** The domain the site sends from, used to spot mail that came from ourselves. */
export async function senderDomain(): Promise<string> {
  return parseSender(await getConfig('SMTP_FROM')).address.split('@')[1]?.toLowerCase() ?? ''
}
