import DOMPurify from 'isomorphic-dompurify'

/**
 * HTML sanitizer for admin-authored rich text (CKEditor output).
 *
 * This was previously a set of regexes. Regexes cannot sanitize HTML: browsers
 * accept `/` as an attribute separator, so `<img/onerror=alert(1)>` and
 * `<svg/onload=alert(1)>` both slipped past a `/\s+on\w+/` filter, and an
 * entity-encoded `&#106;avascript:` defeated the protocol check. CSP is no
 * backstop either — next.config.js allows 'unsafe-inline'.
 *
 * isomorphic-dompurify parses the document properly and runs server-side,
 * which matters because these call sites are React Server Components.
 */

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height', 'loading',
  // id is allowed so in-page anchor links and CKEditor headings keep working.
  'class', 'id', 'colspan', 'rowspan', 'scope', 'dir', 'lang',
]

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Anchors opening a new tab get rel="noopener noreferrer" so the destination
  // cannot reach back through window.opener.
  if (node.tagName === 'A' && node.hasAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer')
  }

  // DOMPurify's defaults already reject javascript: on href and src, but they
  // permit data: on img src. We have no use for data: URIs in authored content,
  // and they are an exfiltration and content-smuggling vector, so drop them.
  // Values are compared post-parse, so entity-encoded forms are already decoded.
  for (const attr of ['href', 'src']) {
    const value = node.getAttribute?.(attr)
    if (value && /^\s*data:/i.test(value)) {
      node.removeAttribute(attr)
    }
  }
})

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // NOTE: deliberately NOT setting ALLOWED_URI_REGEXP. DOMPurify applies it to
    // every attribute value, not just URI-bearing ones, which silently strips
    // target="_blank", width and height. Its built-in URI handling already
    // rejects javascript: (including entity-encoded and mixed-case forms); the
    // afterSanitizeAttributes hook above covers the data: gap it leaves.
    // Discard the contents of these elements, not just their tags.
    FORBID_CONTENTS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'object', 'embed', 'form',
      'input', 'button', 'link', 'meta', 'base', 'applet', 'svg', 'math',
    ],
  })
}
