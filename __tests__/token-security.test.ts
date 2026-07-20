import { describe, it, expect, beforeAll } from 'vitest'
import crypto from 'crypto'
import { unsubscribeToken, verifyUnsubscribeToken } from '@/lib/domain/unsubscribe'
import { confirmToken, verifyConfirmToken } from '@/lib/domain/confirm-subscribe'
import { derivedKey } from '@/lib/util/token-keys'
import { isPrivateAddress } from '@/lib/util/safe-fetch'

const SECRET = 'test-secret-for-token-security'
const EMAIL = 'reader@example.com'

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = SECRET
  process.env.NEXT_PUBLIC_SITE_URL = 'https://bododesderio.com'
})

describe('key derivation', () => {
  it('gives different purposes different keys', () => {
    expect(derivedKey('a').equals(derivedKey('b'))).toBe(false)
  })

  it('is deterministic for the same purpose', () => {
    expect(derivedKey('a').equals(derivedKey('a'))).toBe(true)
  })

  it('does not reuse the raw session secret as a token key', () => {
    expect(derivedKey('newsletter-unsubscribe').toString('hex')).not.toBe(
      Buffer.from(SECRET).toString('hex'),
    )
  })
})

describe('unsubscribe tokens', () => {
  it('accepts a token it issued', () => {
    expect(verifyUnsubscribeToken(EMAIL, unsubscribeToken(EMAIL))).toBe(true)
  })

  it('rejects a token for a different address', () => {
    expect(verifyUnsubscribeToken('other@example.com', unsubscribeToken(EMAIL))).toBe(false)
  })

  it('still accepts legacy tokens from already-delivered email', () => {
    // CAN-SPAM: an unsubscribe link must keep working for the life of the mail
    // it was sent in. Breaking these would be a compliance problem.
    const legacy = crypto.createHmac('sha256', SECRET).update(EMAIL).digest('hex')
    expect(verifyUnsubscribeToken(EMAIL, legacy)).toBe(true)
  })

  it('rejects malformed tokens without throwing', () => {
    expect(verifyUnsubscribeToken(EMAIL, '')).toBe(false)
    expect(verifyUnsubscribeToken(EMAIL, 'zzzz')).toBe(false)
    expect(verifyUnsubscribeToken(EMAIL, unsubscribeToken(EMAIL).slice(0, 20))).toBe(false)
  })
})

describe('confirmation tokens', () => {
  it('accepts a fresh token', () => {
    expect(verifyConfirmToken(EMAIL, confirmToken(EMAIL))).toBe(true)
  })

  it('rejects a token past its expiry', () => {
    const issued = confirmToken(EMAIL, Date.now())
    const eightDaysLater = Date.now() + 8 * 24 * 60 * 60 * 1000
    expect(verifyConfirmToken(EMAIL, issued, eightDaysLater)).toBe(false)
  })

  it('refuses an expiry extended by editing the URL', () => {
    const issued = confirmToken(EMAIL)
    const forged = `${Date.now() + 10 ** 12}.${issued.split('.')[1]}`
    expect(verifyConfirmToken(EMAIL, forged)).toBe(false)
  })

  it('still accepts legacy tokens already in flight', () => {
    const legacy = crypto.createHmac('sha256', SECRET).update('confirm:' + EMAIL).digest('hex')
    expect(verifyConfirmToken(EMAIL, legacy)).toBe(true)
  })
})

describe('SSRF address filtering', () => {
  it('blocks loopback, RFC1918 and cloud metadata', () => {
    for (const ip of ['127.0.0.1', '10.0.0.5', '172.16.0.1', '192.168.1.1', '169.254.169.254']) {
      expect(isPrivateAddress(ip)).toBe(true)
    }
  })

  it('blocks IPv6 loopback, unique-local and IPv4-mapped private', () => {
    for (const ip of ['::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1']) {
      expect(isPrivateAddress(ip)).toBe(true)
    }
  })

  it('allows ordinary public addresses', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '2606:4700:4700::1111']) {
      expect(isPrivateAddress(ip)).toBe(false)
    }
  })

  it('refuses anything it cannot parse', () => {
    expect(isPrivateAddress('not-an-ip')).toBe(true)
  })
})
