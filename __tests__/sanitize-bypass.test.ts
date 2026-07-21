import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/lib/util/sanitize'
describe('bypasses that defeated the old regex sanitizer', () => {
  const attacks = [
    '<img/onerror=alert(1) src=x>',
    '<svg/onload=alert(1)>',
    '<a href="&#106;avascript:alert(1)">x</a>',
    '<img src=x onerror=alert(1)>',
    '<a href="javascript:alert(1)">x</a>',
    '<div onclick=alert(1)>x</div>',
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
    '<iframe src="evil.com"></iframe>',
    '<math><mtext><script>alert(1)</script></mtext></math>',
  ]
  for (const a of attacks) {
    it(`neutralises ${a}`, () => {
      const out = sanitizeHtml(a)
      expect(out).not.toMatch(/onerror|onload|onclick/i)
      expect(out).not.toMatch(/javascript:/i)
      expect(out).not.toMatch(/<script|<iframe|<svg/i)
      expect(out).not.toMatch(/data:text\/html/i)
    })
  }
})

describe('legitimate rich text survives intact', () => {
  it('keeps target and rel on links', () => {
    const out = sanitizeHtml('<a href="https://example.com" target="_blank">Link</a>')
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer"')
  })
  it('keeps image dimensions and alt', () => {
    const out = sanitizeHtml('<img src="/uploads/p.jpg" alt="A photo" width="800" height="600">')
    expect(out).toContain('alt="A photo"')
    expect(out).toContain('width="800"')
    expect(out).toContain('height="600"')
  })
  it('keeps mailto and relative links', () => {
    expect(sanitizeHtml('<a href="mailto:a@b.com">m</a>')).toContain('mailto:a@b.com')
    expect(sanitizeHtml('<a href="/blog/x">b</a>')).toContain('href="/blog/x"')
  })
  it('drops data: URIs on img src', () => {
    const out = sanitizeHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">')
    expect(out).not.toMatch(/data:/i)
  })
  it('preserves tables and formatting from CKEditor', () => {
    const html = '<table><tbody><tr><td colspan="2">cell</td></tr></tbody></table>'
    expect(sanitizeHtml(html)).toContain('colspan="2"')
    expect(sanitizeHtml('<p>a <strong>b</strong> <em>c</em></p>')).toBe('<p>a <strong>b</strong> <em>c</em></p>')
  })
})
