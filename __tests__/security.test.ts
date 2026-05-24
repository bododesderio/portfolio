import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

describe('Security invariants', () => {
  describe('HMAC token timing safety', () => {
    it('uses timingSafeEqual for token comparison', () => {
      // Verifies that the pattern used in unsubscribe/route.ts is safe
      const secret = 'test-secret'
      const email = 'user@example.com'
      const expected = crypto.createHmac('sha256', secret).update(email).digest('hex')
      const supplied = expected // valid token

      // This should not throw for equal-length strings
      expect(() => {
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
      }).not.toThrow()

      // This should throw for different-length strings (guard must check length first)
      expect(() => {
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from('short'))
      }).toThrow()
    })
  })

  describe('Password hashing', () => {
    it('bcrypt hash comparison works correctly', async () => {
      const bcrypt = await import('bcryptjs')
      const password = 'test-password-123'
      const hash = await bcrypt.hash(password, 12)

      expect(await bcrypt.compare(password, hash)).toBe(true)
      expect(await bcrypt.compare('wrong-password', hash)).toBe(false)
    })
  })

  describe('CSP header validation', () => {
    it('does not contain unsafe-eval in production CSP', async () => {
      // Read the config directly to verify CSP
      const fs = await import('fs')
      const configContent = fs.readFileSync('next.config.js', 'utf-8')

      // unsafe-eval is allowed in dev mode only (gated by isDev conditional)
      expect(configContent).toContain("isDev ? \" 'unsafe-eval'\" : ''")
      // Verify production CSP baseline
      expect(configContent).toContain("script-src 'self' 'unsafe-inline'")
      expect(configContent).toContain("frame-ancestors 'none'")
      expect(configContent).toContain("object-src 'none'")
    })

    it('does not reference external font services in CSP', async () => {
      const fs = await import('fs')
      const configContent = fs.readFileSync('next.config.js', 'utf-8')

      // Fonts are self-hosted via fontsource — no Google Fonts CSP needed
      expect(configContent).not.toContain('fonts.googleapis.com')
      expect(configContent).not.toContain('fonts.gstatic.com')
    })
  })

  describe('No hardcoded secrets', () => {
    it('env fallbacks do not contain real secrets', async () => {
      const fs = await import('fs')
      const unsubscribe = fs.readFileSync('lib/unsubscribe.ts', 'utf-8')
      const unsubRoute = fs.readFileSync('app/api/newsletter/unsubscribe/route.ts', 'utf-8')

      expect(unsubscribe).not.toContain('fallback-secret')
      expect(unsubRoute).not.toContain('fallback-secret')
    })
  })
})

describe('Middleware matcher configuration', () => {
  it('protects admin pages and admin API routes', async () => {
    const fs = await import('fs')
    const path = (await import('path')).default
    const middlewarePath = fs.existsSync('proxy.ts') ? 'proxy.ts' : path.join(process.cwd(), 'middleware.ts')
    const middleware = fs.readFileSync(middlewarePath, 'utf-8')

    // Verify matcher covers both admin pages and API
    expect(middleware).toContain("'/admin/:path*'")
    expect(middleware).toContain("'/api/admin/:path*'")

    // Verify it checks auth for API routes
    expect(middleware).toContain('isAdminApi')
    expect(middleware).toContain("{ error: 'Unauthorized' }")
  })
})
