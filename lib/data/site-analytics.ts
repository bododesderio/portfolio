import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/data/db'
import {
  referrerHost,
  sectionForPath,
  type AnalyticsRange,
  type Granularity,
} from '@/lib/domain/analytics-range'

const DAY = 86_400_000
/** Buckets are calendar days in Kampala (UTC+3 all year); timestamps are stored in UTC. */
const LOCAL = Prisma.sql`interval '3 hours'`

type Bucketed = { bucket: string; views?: number; visitors?: number; count?: number }

function bucketKeys(range: AnalyticsRange): string[] {
  const keys: string[] = []
  const local = (date: Date) => new Date(date.getTime() + 3 * 3600_000)
  const cursor = local(range.from)
  cursor.setUTCHours(0, 0, 0, 0)
  if (range.granularity === 'week') cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7))
  if (range.granularity === 'month') cursor.setUTCDate(1)
  const end = local(range.to)
  while (cursor <= end && keys.length < 400) {
    keys.push(cursor.toISOString().slice(0, 10))
    if (range.granularity === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1)
    else if (range.granularity === 'week') cursor.setUTCDate(cursor.getUTCDate() + 7)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return keys
}

function fill<T extends Bucketed>(range: AnalyticsRange, rows: T[], empty: Omit<T, 'bucket'>): T[] {
  const byKey = new Map(rows.map((row) => [row.bucket, row]))
  return bucketKeys(range).map((bucket) => byKey.get(bucket) ?? ({ bucket, ...empty } as T))
}

async function trafficTotals(from: Date, to: Date) {
  const [row] = await prisma.$queryRaw<Array<{ views: number; visitors: number }>>`
    SELECT COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS visitors
    FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}`
  return row ?? { views: 0, visitors: 0 }
}

async function audienceTotals(from: Date, to: Date) {
  const [messages, subscribers] = await Promise.all([
    prisma.message.count({ where: { receivedAt: { gte: from, lte: to } } }),
    prisma.subscriber.count({ where: { confirmed: true, subscribedAt: { gte: from, lte: to } } }),
  ])
  return { messages, subscribers }
}

function trunc(granularity: Granularity, column: Prisma.Sql) {
  return Prisma.sql`to_char(date_trunc(${granularity}, ${column} + ${LOCAL}), 'YYYY-MM-DD')`
}

export async function getSiteAnalytics(range: AnalyticsRange, ownHost: string | null) {
  const { from, to, granularity } = range
  const [
    current,
    previous,
    audienceNow,
    audienceBefore,
    traffic,
    paths,
    funnelRow,
    writing,
    work,
    referrers,
    countries,
    messageSeries,
    subscriberSeries,
  ] = await Promise.all([
    trafficTotals(from, to),
    trafficTotals(range.previousFrom, range.previousTo),
    audienceTotals(from, to),
    audienceTotals(range.previousFrom, range.previousTo),
    prisma.$queryRaw<Array<{ bucket: string; views: number; visitors: number }>>`
      SELECT ${trunc(granularity, Prisma.sql`created_at`)} AS bucket,
             COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS visitors
      FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<Array<{ path: string; views: number; visitors: number }>>`
      SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS visitors
      FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY path ORDER BY views DESC LIMIT 500`,
    prisma.$queryRaw<
      Array<{ visitors: number; writing: number; work: number; contact: number }>
    >`
      SELECT COUNT(DISTINCT session_id)::int AS visitors,
             (COUNT(DISTINCT session_id) FILTER (WHERE path LIKE '/blog/%'))::int AS writing,
             (COUNT(DISTINCT session_id) FILTER (WHERE path = '/projects' OR path LIKE '/projects/%'))::int AS work,
             (COUNT(DISTINCT session_id) FILTER (WHERE path = '/contact'))::int AS contact
      FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}`,
    prisma.$queryRaw<Array<{ label: string; views: number; visitors: number }>>`
      SELECT COALESCE(b.title, p.path) AS label, COUNT(*)::int AS views, COUNT(DISTINCT p.session_id)::int AS visitors
      FROM page_views p LEFT JOIN blog_posts b ON p.path = '/blog/' || b.slug
      WHERE p.created_at >= ${from} AND p.created_at <= ${to} AND p.path LIKE '/blog/%'
      GROUP BY 1 ORDER BY views DESC LIMIT 8`,
    prisma.$queryRaw<Array<{ label: string; views: number; visitors: number }>>`
      SELECT COALESCE(pr.title, p.path) AS label, COUNT(*)::int AS views, COUNT(DISTINCT p.session_id)::int AS visitors
      FROM page_views p LEFT JOIN projects pr ON p.path = '/projects/' || pr.slug
      WHERE p.created_at >= ${from} AND p.created_at <= ${to} AND p.path LIKE '/projects/%'
      GROUP BY 1 ORDER BY views DESC LIMIT 8`,
    prisma.$queryRaw<Array<{ referrer: string | null; visitors: number }>>`
      SELECT referrer, COUNT(DISTINCT session_id)::int AS visitors
      FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY referrer ORDER BY visitors DESC LIMIT 200`,
    prisma.$queryRaw<Array<{ country: string | null; visitors: number }>>`
      SELECT country, COUNT(DISTINCT session_id)::int AS visitors
      FROM page_views WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY country ORDER BY visitors DESC LIMIT 12`,
    prisma.$queryRaw<Array<{ bucket: string; count: number }>>`
      SELECT ${trunc(granularity, Prisma.sql`received_at`)} AS bucket, COUNT(*)::int AS count
      FROM messages WHERE received_at >= ${from} AND received_at <= ${to} GROUP BY 1`,
    prisma.$queryRaw<Array<{ bucket: string; count: number }>>`
      SELECT ${trunc(granularity, Prisma.sql`subscribed_at`)} AS bucket, COUNT(*)::int AS count
      FROM subscribers WHERE confirmed = true AND subscribed_at >= ${from} AND subscribed_at <= ${to} GROUP BY 1`,
  ])

  const sections = new Map<string, number>()
  for (const row of paths) sections.set(sectionForPath(row.path), (sections.get(sectionForPath(row.path)) ?? 0) + row.views)

  const sources = new Map<string, number>()
  let direct = 0
  for (const row of referrers) {
    const host = referrerHost(row.referrer)
    if (!host || host === ownHost) direct += row.visitors
    else sources.set(host, (sources.get(host) ?? 0) + row.visitors)
  }

  const messagesByBucket = new Map(messageSeries.map((row) => [row.bucket, row.count]))
  const subscribersByBucket = new Map(subscriberSeries.map((row) => [row.bucket, row.count]))
  const funnel = funnelRow[0] ?? { visitors: 0, writing: 0, work: 0, contact: 0 }

  return {
    totals: {
      current: { ...current, ...audienceNow },
      previous: { ...previous, ...audienceBefore },
    },
    traffic: fill(range, traffic, { views: 0, visitors: 0 }),
    audience: bucketKeys(range).map((bucket) => ({
      bucket,
      messages: messagesByBucket.get(bucket) ?? 0,
      subscribers: subscribersByBucket.get(bucket) ?? 0,
    })),
    funnel: [
      { label: 'Visited the site', count: funnel.visitors },
      { label: 'Read a piece of writing', count: funnel.writing },
      { label: 'Looked at work', count: funnel.work },
      { label: 'Opened the contact page', count: funnel.contact },
      { label: 'Sent a message', count: audienceNow.messages },
    ],
    pages: paths.slice(0, 10).map((row) => ({ label: row.path, views: row.views, visitors: row.visitors })),
    sections: [...sections.entries()].map(([label, views]) => ({ label, views })).sort((a, b) => b.views - a.views),
    writing,
    work,
    referrers: [
      ...(direct ? [{ label: 'Direct or unknown', visitors: direct }] : []),
      ...[...sources.entries()].map(([label, visitors]) => ({ label, visitors })),
    ]
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10),
    countries: countries.map((row) => ({ label: row.country || 'Not recorded', visitors: row.visitors })),
    days: Math.round((to.getTime() - from.getTime()) / DAY),
  }
}

export type SiteAnalytics = Awaited<ReturnType<typeof getSiteAnalytics>>
