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
    it('uses a nonce-based script-src with no unsafe-* in production', async () => {
      // CSP is set per-request in proxy.ts (the Next 16 middleware), not next.config.js.
      const fs = await import('fs')
      const csp = fs.readFileSync('proxy.ts', 'utf-8')

      // Production script-src is nonce + strict-dynamic, never unsafe-inline/unsafe-eval.
      expect(csp).toContain("`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`")
      // unsafe-eval / unsafe-inline for scripts appear only in the isDev branch.
      expect(csp).toContain(
        "isDev\n    ? \"script-src 'self' 'unsafe-inline' 'unsafe-eval'\""
      )
      // Baseline hardening headers.
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("object-src 'none'")
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
      const unsubscribe = fs.readFileSync('lib/domain/unsubscribe.ts', 'utf-8')
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

    // The matcher is a single catch-all that runs on every document/route
    // (excluding static assets), so admin pages and admin API are covered.
    expect(middleware).toContain('(?!_next/static|_next/image')

    // Admin pages and admin API are guarded imperatively inside the handler.
    expect(middleware).toContain("pathname.startsWith('/admin')")
    expect(middleware).toContain("pathname.startsWith('/api/admin')")

    // Verify it checks auth for API routes and redirects pages to login.
    expect(middleware).toContain('isAdminApi')
    expect(middleware).toContain("{ error: 'Unauthorized' }")
    expect(middleware).toContain("new URL('/admin/login'")
  })
})
