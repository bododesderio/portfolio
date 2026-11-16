import { NextRequest, NextResponse } from 'next/server'
import {
  normalizeSearchQuery,
  searchPublicContent,
} from '@/lib/data/public-search'
import { getClientIp, rateLimit } from '@/lib/util/rate-limit'
export async function GET(request: NextRequest) {
  const query = normalizeSearchQuery(
    request.nextUrl.searchParams.get('q') || ''
  )
  if (query.length < 2) return NextResponse.json({ results: [] })
  const limit = await rateLimit(`public-search:${getClientIp(request)}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!limit.ok)
    return NextResponse.json(
      { error: 'Please wait a moment before searching again.' },
      { status: 429 }
    )
  try {
    return NextResponse.json({ results: await searchPublicContent(query) })
  } catch {
    return NextResponse.json(
      { error: 'Search is unavailable. Please try again shortly.' },
      { status: 503 }
    )
  }
}
