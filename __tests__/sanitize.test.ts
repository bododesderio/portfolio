import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '../lib/util/sanitize'

describe('HTML sanitizer', () => {
  it('passes through safe HTML unchanged', () => {
    const html = '<h1>Hello</h1><p>World <strong>bold</strong></p>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('strips <script> tags', () => {
    expect(sanitizeHtml('<p>Hi</p><script>alert("xss")</script>')).toBe('<p>Hi</p>')
  })

  it('strips <script> with attributes', () => {
    expect(sanitizeHtml('<script src="evil.js"></script><p>safe</p>')).toBe('<p>safe</p>')
  })

  it('strips <iframe> tags', () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('')
  })

  it('strips <object> tags', () => {
    expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('')
  })

  it('strips <embed> tags', () => {
    expect(sanitizeHtml('<embed src="evil.swf">')).toBe('')
  })

  it('strips <form> tags and their controls', () => {
    // Stricter than the previous regex sanitizer, which left the bare <input>.
    expect(sanitizeHtml('<form action="evil.com"><input></form>')).toBe('')
  })

  it('removes event handler attributes', () => {
    expect(sanitizeHtml('<img src="x.jpg" onerror="alert(1)">')).toBe('<img src="x.jpg">')
  })

  it('removes onclick attributes', () => {
    expect(sanitizeHtml('<a href="/safe" onclick="steal()">link</a>')).toBe('<a href="/safe">link</a>')
  })

  it('removes onload attributes', () => {
    // <body> is not in the allowlist, so the element goes too.
    expect(sanitizeHtml('<body onload="evil()">')).toBe('')
    expect(sanitizeHtml('<div onload="evil()">x</div>')).toBe('<div>x</div>')
  })

  it('neutralizes javascript: URLs in href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
    // The attribute is dropped outright now, rather than rewritten to
    // about:blank as the old regex sanitizer did.
    expect(result).toBe('<a>click</a>')
  })

  it('neutralizes javascript: URLs in src', () => {
    const result = sanitizeHtml('<img src="javascript:alert(1)">')
    expect(result).not.toContain('javascript:')
  })

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('handles null-ish input', () => {
    expect(sanitizeHtml(undefined as unknown as string)).toBe('')
    expect(sanitizeHtml(null as unknown as string)).toBe('')
  })

  it('preserves safe attributes like class and id', () => {
    const html = '<div class="prose" id="content"><p>text</p></div>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('preserves images with safe attributes', () => {
    const html = '<img src="/uploads/photo.jpg" alt="A photo" width="800">'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('preserves links with safe attributes', () => {
    const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
    // rel is upgraded to include noreferrer for any link opening a new tab.
    expect(sanitizeHtml(html)).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>',
    )
  })

  it('case-insensitive script stripping', () => {
    expect(sanitizeHtml('<SCRIPT>alert(1)</SCRIPT>')).toBe('')
    expect(sanitizeHtml('<Script>alert(1)</Script>')).toBe('')
  })
})
