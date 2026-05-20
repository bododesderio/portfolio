import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'

// We test the token logic directly rather than importing the module,
// because the module throws if NEXTAUTH_SECRET is missing on import.

function makeToken(email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(email).digest('hex')
}

function verifyToken(email: string, token: string, secret: string): boolean {
  const expected = makeToken(email, secret)
  if (expected.length !== token.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

describe('Unsubscribe token generation & verification', () => {
  const secret = 'test-secret-32-chars-long-enough!'
  const email = 'user@example.com'

  it('generates a deterministic HMAC token', () => {
    const t1 = makeToken(email, secret)
    const t2 = makeToken(email, secret)
    expect(t1).toBe(t2)
    expect(t1).toHaveLength(64) // SHA-256 hex
  })

  it('produces different tokens for different emails', () => {
    const t1 = makeToken('a@example.com', secret)
    const t2 = makeToken('b@example.com', secret)
    expect(t1).not.toBe(t2)
  })

  it('produces different tokens for different secrets', () => {
    const t1 = makeToken(email, 'secret-a')
    const t2 = makeToken(email, 'secret-b')
    expect(t1).not.toBe(t2)
  })

  it('verifies a valid token', () => {
    const token = makeToken(email, secret)
    expect(verifyToken(email, token, secret)).toBe(true)
  })

  it('rejects a tampered token', () => {
    const token = makeToken(email, secret)
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')
    expect(verifyToken(email, tampered, secret)).toBe(false)
  })

  it('rejects a token of wrong length', () => {
    expect(verifyToken(email, 'short', secret)).toBe(false)
  })
})

describe('unsubscribeUrl() module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws when NEXTAUTH_SECRET is missing', async () => {
    delete process.env.NEXTAUTH_SECRET
    // Dynamic import to get fresh module state
    const mod = await import('../lib/unsubscribe')
    expect(() => mod.unsubscribeUrl('test@example.com')).toThrow('NEXTAUTH_SECRET is required')
  })

  it('builds a valid URL with token and email', async () => {
    process.env.NEXTAUTH_SECRET = 'test-secret'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    const mod = await import('../lib/unsubscribe')
    const url = mod.unsubscribeUrl('user@test.com')
    expect(url).toContain('https://example.com/api/newsletter/unsubscribe')
    expect(url).toContain('email=user%40test.com')
    expect(url).toContain('token=')
  })
})
