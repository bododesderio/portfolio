import crypto from 'crypto'

/**
 * Purpose-scoped key derivation for signed links.
 *
 * Newsletter tokens previously used NEXTAUTH_SECRET directly as the HMAC key,
 * the same key that signs session JWTs. That couples unrelated risks: a flaw
 * that leaks one signing context leaks the other. HKDF gives every purpose an
 * independent key derived from the same root secret, so rotating stays a
 * one-variable operation while the contexts stay isolated.
 */
const HKDF_SALT = 'bododesderio-portfolio-tokens:v1'

export function derivedKey(purpose: string): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is required to derive token keys')
  return Buffer.from(crypto.hkdfSync('sha256', secret, HKDF_SALT, purpose, 32))
}

/** Constant-time hex comparison that tolerates malformed input. */
export function safeHexEqual(expected: string, provided: string): boolean {
  if (!provided) return false
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(provided, 'hex')
  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (a.length === 0 || a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/** HMAC of `payload` under the key for `purpose`. */
export function sign(purpose: string, payload: string): string {
  return crypto.createHmac('sha256', derivedKey(purpose)).update(payload).digest('hex')
}

/**
 * Legacy scheme: HMAC directly under NEXTAUTH_SECRET.
 *
 * Still accepted when verifying so that links in already-delivered email keep
 * working. Never used to issue new tokens.
 */
export function legacySign(payload: string): string | null {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}
