import { legacySign, safeHexEqual, sign } from '@/lib/util/token-keys'

const PURPOSE = 'newsletter-confirm'

/**
 * Confirmation links expire after 7 days.
 *
 * Unlike unsubscribe tokens, these grant something — they add an address to the
 * list — so an unbounded lifetime is a real exposure: a link leaked through a
 * forwarded mail or a referer header would stay usable forever.
 *
 * Format: `<expiryEpochMs>.<hmac>`. The expiry is part of the signed payload,
 * so it cannot be extended by editing the URL.
 */
const TTL_MS = 7 * 24 * 60 * 60 * 1000

function payload(email: string, expiresAt: number): string {
  return `${email}:${expiresAt}`
}

export function confirmToken(email: string, now = Date.now()): string {
  const expiresAt = now + TTL_MS
  return `${expiresAt}.${sign(PURPOSE, payload(email, expiresAt))}`
}

export function confirmUrl(email: string): string {
  const token = confirmToken(email)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return `${baseUrl}/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${token}`
}

export function verifyConfirmToken(email: string, token: string, now = Date.now()): boolean {
  if (!token) return false

  const separator = token.indexOf('.')
  if (separator > 0) {
    const expiresAt = Number(token.slice(0, separator))
    const signature = token.slice(separator + 1)
    if (!Number.isFinite(expiresAt) || expiresAt <= now) return false
    return safeHexEqual(sign(PURPOSE, payload(email, expiresAt)), signature)
  }

  // Legacy scheme: unbounded lifetime, HMAC directly under NEXTAUTH_SECRET.
  // Accepted so confirmation mails already in flight keep working. This branch
  // can be deleted once those have aged out.
  const legacy = legacySign('confirm:' + email)
  return legacy ? safeHexEqual(legacy, token) : false
}
