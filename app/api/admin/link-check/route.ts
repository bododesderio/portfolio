import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { safeFetch } from '@/lib/util/safe-fetch'

export const dynamic = 'force-dynamic'

interface LinkResult {
  url: string
  source: string
  status: number | null
  ok: boolean
  error?: string
}

function extractUrls(html: string): string[] {
  const matches = html.match(/href=["'](https?:\/\/[^"']+)["']/gi) ?? []
  return matches.map((m) => m.replace(/^href=["']|["']$/g, ''))
}

async function checkUrl(url: string): Promise<{ status: number | null; ok: boolean; error?: string }> {
  // safeFetch refuses private address space and re-validates every redirect
  // hop, so a linked host cannot bounce this request into the internal network.
  try {
    const res = await safeFetch(url, { method: 'HEAD' })
    return { status: res.status, ok: res.ok }
  } catch (err) {
    // Some servers reject HEAD — retry once with GET.
    try {
      const res = await safeFetch(url, { method: 'GET' })
      return { status: res.status, ok: res.ok }
    } catch {
      return { status: null, ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }
}

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Collect all URLs to check
  const urlMap = new Map<string, string>() // url -> source label

  // Press items
  const pressItems = await prisma.pressItem.findMany({
    select: { title: true, externalUrl: true, sourceUrl: true, downloadUrl: true },
  })
  for (const item of pressItems) {
    if (item.externalUrl) urlMap.set(item.externalUrl, `Press: ${item.title}`)
    if (item.sourceUrl) urlMap.set(item.sourceUrl, `Press: ${item.title}`)
    if (item.downloadUrl) urlMap.set(item.downloadUrl, `Press: ${item.title}`)
  }

  // Blog post bodies
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    select: { title: true, body: true },
  })
  for (const post of posts) {
    const urls = extractUrls(post.body)
    for (const url of urls) {
      urlMap.set(url, `Blog: ${post.title}`)
    }
  }

  // Client websites
  const clients = await prisma.client.findMany({
    select: { name: true, website: true },
  })
  for (const client of clients) {
    if (client.website) urlMap.set(client.website, `Client: ${client.name}`)
  }

  // Check all URLs (batch of 10 concurrent)
  const entries = Array.from(urlMap.entries())
  const results: LinkResult[] = []

  for (let i = 0; i < entries.length; i += 10) {
    const batch = entries.slice(i, i + 10)
    const checked = await Promise.all(
      batch.map(async ([url, source]) => {
        const result = await checkUrl(url)
        return { url, source, ...result }
      }),
    )
    results.push(...checked)
  }

  const broken = results.filter((r) => !r.ok)

  return NextResponse.json({
    total: results.length,
    broken: broken.length,
    results,
  })
}
