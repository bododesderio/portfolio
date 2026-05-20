import { describe, it, expect } from 'vitest'

/**
 * Tests the media upload validation logic.
 * Mirrors the magic bytes and MIME validation from
 * app/api/admin/media/upload/route.ts
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const sigs = MAGIC_BYTES[mimeType]
  if (!sigs) return true
  return sigs.some(sig => sig.every((byte, i) => buffer[i] === byte))
}

describe('MIME type allowlist', () => {
  it('allows JPEG', () => expect(ALLOWED_TYPES.includes('image/jpeg')).toBe(true))
  it('allows PNG', () => expect(ALLOWED_TYPES.includes('image/png')).toBe(true))
  it('allows WebP', () => expect(ALLOWED_TYPES.includes('image/webp')).toBe(true))
  it('allows GIF', () => expect(ALLOWED_TYPES.includes('image/gif')).toBe(true))
  it('allows SVG', () => expect(ALLOWED_TYPES.includes('image/svg+xml')).toBe(true))
  it('allows PDF', () => expect(ALLOWED_TYPES.includes('application/pdf')).toBe(true))
  it('rejects executable', () => expect(ALLOWED_TYPES.includes('application/x-executable')).toBe(false))
  it('rejects HTML', () => expect(ALLOWED_TYPES.includes('text/html')).toBe(false))
  it('rejects JavaScript', () => expect(ALLOWED_TYPES.includes('application/javascript')).toBe(false))
})

describe('Magic bytes validation', () => {
  it('validates JPEG magic bytes', () => {
    const valid = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00])
    expect(validateMagicBytes(valid, 'image/jpeg')).toBe(true)
  })

  it('rejects wrong magic bytes for JPEG', () => {
    const invalid = Buffer.from([0x89, 0x50, 0x4E, 0x47]) // PNG bytes
    expect(validateMagicBytes(invalid, 'image/jpeg')).toBe(false)
  })

  it('validates PNG magic bytes', () => {
    const valid = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D])
    expect(validateMagicBytes(valid, 'image/png')).toBe(true)
  })

  it('validates GIF magic bytes', () => {
    const valid = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39])
    expect(validateMagicBytes(valid, 'image/gif')).toBe(true)
  })

  it('validates WebP (RIFF) magic bytes', () => {
    const valid = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00])
    expect(validateMagicBytes(valid, 'image/webp')).toBe(true)
  })

  it('validates PDF magic bytes', () => {
    const valid = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D])
    expect(validateMagicBytes(valid, 'application/pdf')).toBe(true)
  })

  it('passes SVG through (text-based, no magic bytes)', () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    expect(validateMagicBytes(svgBuffer, 'image/svg+xml')).toBe(true)
  })

  it('detects MIME spoofing (PNG bytes claimed as JPEG)', () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47])
    expect(validateMagicBytes(pngBytes, 'image/jpeg')).toBe(false)
  })
})

describe('SVG script detection', () => {
  function hasDangerousSvg(content: string): boolean {
    return /<script[\s>]/i.test(content) || /on\w+\s*=/i.test(content)
  }

  it('rejects SVG with <script> tag', () => {
    expect(hasDangerousSvg('<svg><script>alert(1)</script></svg>')).toBe(true)
  })

  it('rejects SVG with event handlers', () => {
    expect(hasDangerousSvg('<svg onload="alert(1)"><rect/></svg>')).toBe(true)
  })

  it('rejects SVG with onclick', () => {
    expect(hasDangerousSvg('<svg><rect onclick="evil()"/></svg>')).toBe(true)
  })

  it('accepts clean SVG', () => {
    expect(hasDangerousSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>')).toBe(false)
  })

  it('accepts SVG with safe attributes', () => {
    expect(hasDangerousSvg('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="black"/></svg>')).toBe(false)
  })
})
