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
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = decodeEntities(extractTag(block, 'title'))
    const link = decodeEntities(extractTag(block, 'link'))
    const pubDate = decodeEntities(extractTag(block, 'pubDate'))
    const contentEncoded =
      extractCDATA(block, 'content:encoded') || extractTag(block, 'content:encoded') || ''

    const thumbnail = extractThumbnail(block, contentEncoded)
    const plainText = decodeEntities(
      contentEncoded
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )

    const excerpt =
      plainText.length > 150
        ? `${plainText.slice(0, 150).replace(/\s+\S*$/, '')}...`
        : plainText

    if (title && link) {
      items.push({ title, link, pubDate, excerpt, thumbnail })
    }
  }

  return items
}

function extractThumbnail(block: string, contentEncoded: string): string | null {
  const mediaThumbnailMatch = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
  const contentImgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i)
  const rawUrl = mediaThumbnailMatch?.[1] || contentImgMatch?.[1]

  if (!rawUrl) return null

  const cleaned = decodeEntities(rawUrl).trim()
  return cleaned.startsWith('http://') || cleaned.startsWith('https://') ? cleaned : null
}

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractCDATA(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
