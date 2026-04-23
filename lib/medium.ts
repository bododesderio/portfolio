export interface MediumPost {
  title: string
  link: string
  pubDate: string
  excerpt: string
  thumbnail: string | null
}

/**
 * Fetches and parses the Medium RSS feed for @bodo_desderio.
 * Uses Next.js revalidation (5 min cache) for performance.
 * Returns an empty array on any failure.
 */
export async function fetchMediumPosts(): Promise<MediumPost[]> {
  try {
    const res = await fetch('https://medium.com/feed/@bodo_desderio', {
      next: { revalidate: 300 },
    })

    if (!res.ok) return []

    const xml = await res.text()
    return parseMediumRSS(xml)
  } catch {
    return []
  }
}

function parseMediumRSS(xml: string): MediumPost[] {
  const items: MediumPost[] = []

  // Match each <item>…</item> block
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]

    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const pubDate = extractTag(block, 'pubDate')
    const contentEncoded =
      extractCDATA(block, 'content:encoded') || extractTag(block, 'content:encoded') || ''

    // Extract thumbnail from content:encoded (first <img> src)
    const imgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/)
    const thumbnail = imgMatch ? imgMatch[1] : null

    // Build a plain-text excerpt from content:encoded
    const plainText = contentEncoded
      .replace(/<[^>]+>/g, '')   // strip HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    const excerpt = plainText.length > 150
      ? plainText.slice(0, 150).replace(/\s+\S*$/, '') + '...'
      : plainText

    if (title && link) {
      items.push({ title, link, pubDate: pubDate || '', excerpt, thumbnail })
    }
  }

  return items
}

/** Extract text content from a simple XML tag */
function extractTag(xml: string, tag: string): string {
  // Try CDATA first, then plain text
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
  const m = xml.match(regex)
  return m ? m[1].trim() : ''
}

/** Extract CDATA content specifically */
function extractCDATA(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  const m = xml.match(regex)
  return m ? m[1].trim() : ''
}
