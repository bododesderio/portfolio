import { NextResponse } from 'next/server'
import { withAdmin } from '@/lib/util/with-admin'
import { getSiteAnalytics } from '@/lib/data/site-analytics'
import { parseRange } from '@/lib/domain/analytics-range'
import { csvCell } from '@/lib/util/csv'

export const GET = withAdmin(async ({ req }) => {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const range = parseRange(params)
  const host = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com').hostname.replace(/^www\./, '')
  const data = await getSiteAnalytics(range, host)
  const kind = ['traffic', 'pages', 'referrers', 'audience'].includes(params.kind) ? params.kind : 'traffic'
  const tables: Record<string, Array<Array<string | number>>> = {
    traffic: [['period_start', 'page_views', 'visitors'], ...data.traffic.map((row) => [row.bucket, row.views, row.visitors])],
    pages: [['path', 'page_views', 'visitors'], ...data.pages.map((row) => [row.label, row.views, row.visitors])],
    referrers: [['source', 'visitors'], ...data.referrers.map((row) => [row.label, row.visitors])],
    audience: [
      ['period_start', 'messages', 'new_subscribers'],
      ...data.audience.map((row) => [row.bucket, row.messages, row.subscribers]),
    ],
  }
  const day = (date: Date) => new Date(date.getTime() + 3 * 3600_000).toISOString().slice(0, 10)
  const body = tables[kind].map((row) => row.map(csvCell).join(',')).join('\r\n')
  return new NextResponse(`${body}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="analytics-${kind}-${day(range.from)}-to-${day(range.to)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
})
