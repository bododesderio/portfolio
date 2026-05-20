import { describe, it, expect } from 'vitest'
import { blurUrl, thumbnailUrl, optimizedUrl } from '../lib/image-utils'

describe('Image utils (post-Cloudinary migration)', () => {
  const localUrl = '/uploads/photo-abc123.jpg'
  const externalUrl = 'https://example.com/image.png'

  describe('blurUrl', () => {
    it('returns shimmer SVG for local URLs', () => {
      const result = blurUrl(localUrl)
      expect(result).toContain('data:image/svg+xml')
    })

    it('returns shimmer SVG for external URLs', () => {
      const result = blurUrl(externalUrl)
      expect(result).toContain('data:image/svg+xml')
    })
  })

  describe('thumbnailUrl', () => {
    it('returns the URL unchanged for local images', () => {
      expect(thumbnailUrl(localUrl)).toBe(localUrl)
    })

    it('returns the URL unchanged for external images', () => {
      expect(thumbnailUrl(externalUrl)).toBe(externalUrl)
    })

    it('accepts width parameter without error', () => {
      expect(thumbnailUrl(localUrl, 200)).toBe(localUrl)
    })
  })

  describe('optimizedUrl', () => {
    it('returns the URL unchanged for local images', () => {
      expect(optimizedUrl(localUrl)).toBe(localUrl)
    })

    it('returns the URL unchanged for external images', () => {
      expect(optimizedUrl(externalUrl)).toBe(externalUrl)
    })

    it('accepts maxWidth parameter without error', () => {
      expect(optimizedUrl(localUrl, 1200)).toBe(localUrl)
    })
  })
})
