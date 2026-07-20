/**
 * Lightweight HTML sanitizer for user-generated rich text content.
 * Strips dangerous elements and their content (script, iframe, object, embed, etc.)
 * and event handler attributes (onclick, onerror, etc.) while preserving
 * safe formatting HTML from the CKEditor.
 *
 * For a portfolio where the admin is trusted, this is defense-in-depth
 * against DB compromise or accidental XSS injection.
 */

// Strip dangerous elements AND their inner content
const DANGEROUS_BLOCKS = /<\s*(script|style|iframe|object|embed|applet)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
// Strip remaining self-closing or orphan dangerous tags
const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|link|meta|base|applet|style)\b[^>]*>/gi
const EVENT_ATTRS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URLS = /\b(href|src|action)\s*=\s*["']?\s*javascript:/gi

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(DANGEROUS_BLOCKS, '')
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_ATTRS, '')
    .replace(JAVASCRIPT_URLS, '$1="about:blank"')
}
