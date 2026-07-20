import { legacySign, safeHexEqual, sign } from '@/lib/util/token-keys'

const PURPOSE = 'newsletter-unsubscribe'

export function unsubscribeToken(email: string): string {
  return sign(PURPOSE, email)
}

export function unsubscribeUrl(email: string): string {
  const token = unsubscribeToken(email)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

/**
 * Unsubscribe tokens deliberately do NOT expire.
 *
 * An unsubscribe link has to keep working for the life of the email it was sent
 * in — a recipient may act on a year-old newsletter, and CAN-SPAM expects the
 * mechanism to stay functional. Expiry here would be a compliance problem, not
 * a security win: the token only ever withdraws consent.
 *
 * Tokens issued under the old scheme (raw NEXTAUTH_SECRET as the HMAC key) are
 * still accepted, so links in already-delivered mail keep working.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (safeHexEqual(sign(PURPOSE, email), token)) return true

  const legacy = legacySign(email)
  return legacy ? safeHexEqual(legacy, token) : false
}
