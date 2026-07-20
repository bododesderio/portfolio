import { createHmac, timingSafeEqual } from 'crypto'

/**
 * HMAC signing for email click-tracking destinations.
 *
 * The click tracker redirects to an arbitrary `?url=` param. Without a
 * signature that is an open redirect on our own domain: anyone can obtain a
 * valid EmailLog id by subscribing with a throwaway address, then hand out
 * `https://oursite/api/t/click/<id>?url=https://phishing.example` links that
 * inherit our domain's reputation.
 *
 * Signing binds the destination to the specific email it was sent in, so only
 * URLs we actually put in an email can be redirected to.
 *
 * The purpose string keeps this key derivation distinct from session signing,
 * so a signature here can never be replayed as an auth token.
 */
const PURPOSE = 'email-click-tracking:v1'

function signingSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is required to sign tracking links')
  return secret
}

export function signTrackedUrl(emailLogId: string, url: string): string {
  return createHmac('sha256', signingSecret())
    .update(`${PURPOSE}\n${emailLogId}\n${url}`)
    .digest('hex')
}

export function verifyTrackedUrl(
  emailLogId: string,
  url: string,
  signature: string | null,
): boolean {
  if (!signature) return false

  let expected: string
  try {
    expected = signTrackedUrl(emailLogId, url)
  } catch {
    return false
  }

  const expectedBuf = Buffer.from(expected, 'hex')
  const providedBuf = Buffer.from(signature, 'hex')

  // Buffer.from ignores invalid hex, so compare lengths before timingSafeEqual
  // (it throws on mismatched lengths rather than returning false).
  if (expectedBuf.length === 0 || expectedBuf.length !== providedBuf.length) return false

  return timingSafeEqual(expectedBuf, providedBuf)
}

/**
 * Fallback for links in emails sent before signing existed.
 *
 * Same-origin destinations carry no phishing value, so they stay working.
 * Off-site destinations without a valid signature are refused.
 */
export function isSameOriginUrl(target: URL): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return false
  try {
    return new URL(siteUrl).host === target.host
  } catch {
    return false
  }
}
