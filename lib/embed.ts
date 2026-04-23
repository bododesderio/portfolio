/**
 * Detect the media type and (for embeds) a safe iframe URL or HTML from a raw URL.
 *
 * Returns one of:
 *   { type: 'image' | 'video' | 'doc', url }
 *   { type: 'embed', url, embedUrl, provider }
 *   { type: 'embed', url, embedHtml, provider }
 *   null   — unrecognised
 */
export type DetectedMedia =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string }
  | { type: 'doc'; url: string; filename?: string }
  | { type: 'embed'; url: string; provider: string; embedUrl?: string; embedHtml?: string }

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i
const PDF_EXT_RE   = /\.pdf(\?.*)?$/i

export function detectMediaFromUrl(raw: string): DetectedMedia | null {
  const url = raw.trim()
  if (!/^https?:\/\//i.test(url)) return null

  if (IMAGE_EXT_RE.test(url)) return { type: 'image', url }
  if (VIDEO_EXT_RE.test(url)) return { type: 'video', url }
  if (PDF_EXT_RE.test(url))   return { type: 'doc', url, filename: url.split('/').pop() }

  let parsed: URL
  try { parsed = new URL(url) } catch { return null }
  const host = parsed.hostname.replace(/^www\./, '')

  // YouTube
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
    const id = host === 'youtu.be'
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get('v') || parsed.pathname.match(/\/embed\/([\w-]+)/)?.[1] || ''
    if (id) return { type: 'embed', url, provider: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` }
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean).pop()
    if (id && /^\d+$/.test(id)) return { type: 'embed', url, provider: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}` }
  }

  // Google Docs / Drive (use /preview)
  if (host === 'docs.google.com' || host === 'drive.google.com') {
    const withPreview = url.replace(/\/(edit|view)[^/]*$/, '/preview').replace(/\/pub([?/].*)?$/, '/preview')
    return { type: 'embed', url, provider: 'google-docs', embedUrl: withPreview }
  }

  // Notion (public pages)
  if (host === 'notion.so' || host === 'www.notion.so' || host.endsWith('.notion.site')) {
    return { type: 'embed', url, provider: 'notion', embedUrl: url }
  }

  // X / Twitter — oEmbed-ish, uses platform's blockquote+script. For safety we
  // just render as link card by caller; keep provider marker.
  if (host === 'twitter.com' || host === 'x.com') {
    return { type: 'embed', url, provider: 'x' }
  }

  // LinkedIn — similar: link card fallback, platform's own embed script requires extra rigging.
  if (host === 'linkedin.com' || host === 'www.linkedin.com') {
    return { type: 'embed', url, provider: 'linkedin' }
  }

  // Instagram
  if (host === 'instagram.com' || host === 'www.instagram.com') {
    return { type: 'embed', url, provider: 'instagram' }
  }

  return null
}
