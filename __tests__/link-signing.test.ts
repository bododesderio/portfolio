import { describe, it, expect, beforeAll } from 'vitest'
import { signTrackedUrl, verifyTrackedUrl, isSameOriginUrl } from '@/lib/util/link-signing'

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-for-link-signing'
  process.env.NEXT_PUBLIC_SITE_URL = 'https://bododesderio.com'
})

const LOG_ID = 'clx9k2m0000abc'
const DEST = 'https://medium.com/@bodo_desderio/some-post'

describe('tracked link signing', () => {
  it('accepts a signature it generated', () => {
    const sig = signTrackedUrl(LOG_ID, DEST)
    expect(verifyTrackedUrl(LOG_ID, DEST, sig)).toBe(true)
  })

  it('rejects a missing signature', () => {
    expect(verifyTrackedUrl(LOG_ID, DEST, null)).toBe(false)
    expect(verifyTrackedUrl(LOG_ID, DEST, '')).toBe(false)
  })

  it('rejects a signature bound to a different email', () => {
    const sig = signTrackedUrl('some-other-log-id', DEST)
    expect(verifyTrackedUrl(LOG_ID, DEST, sig)).toBe(false)
  })

  it('rejects a signature bound to a different destination', () => {
    const sig = signTrackedUrl(LOG_ID, DEST)
    expect(verifyTrackedUrl(LOG_ID, 'https://phishing.example/login', sig)).toBe(false)
  })

  it('rejects malformed and truncated signatures without throwing', () => {
    const sig = signTrackedUrl(LOG_ID, DEST)
    expect(verifyTrackedUrl(LOG_ID, DEST, 'not-hex-at-all')).toBe(false)
    expect(verifyTrackedUrl(LOG_ID, DEST, sig.slice(0, 32))).toBe(false)
    expect(verifyTrackedUrl(LOG_ID, DEST, sig + 'ff')).toBe(false)
  })

  it('is deterministic', () => {
    expect(signTrackedUrl(LOG_ID, DEST)).toBe(signTrackedUrl(LOG_ID, DEST))
  })
})

describe('same-origin fallback for pre-signing emails', () => {
  it('allows destinations on our own host', () => {
    expect(isSameOriginUrl(new URL('https://bododesderio.com/blog/post'))).toBe(true)
  })

  it('refuses off-site destinations', () => {
    expect(isSameOriginUrl(new URL('https://evil.example/login'))).toBe(false)
  })

  it('refuses lookalike hosts that merely contain our domain', () => {
    expect(isSameOriginUrl(new URL('https://bododesderio.com.evil.example/'))).toBe(false)
    expect(isSameOriginUrl(new URL('https://notbododesderio.com/'))).toBe(false)
  })

  it('treats a different port as a different origin', () => {
    expect(isSameOriginUrl(new URL('https://bododesderio.com:8443/'))).toBe(false)
  })
})
