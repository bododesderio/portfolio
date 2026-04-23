import { prisma } from './db'

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function countInRange(from: Date, to: Date): Promise<number> {
  try {
    return await prisma.pageView.count({ where: { createdAt: { gte: from, lte: to } } })
  } catch {
    return 0
  }
}

export async function countWithDelta(days: number): Promise<{ current: number; previous: number; delta: number }> {
  const now = new Date()
  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previousStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000)

  const [current, previous] = await Promise.all([
    countInRange(currentStart, now),
    countInRange(previousStart, currentStart),
  ])

  const delta = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100)
  return { current, previous, delta }
}

export async function dailyPageViews(days: number): Promise<Array<{ date: string; count: number }>> {
  const now = new Date()
  const start = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000))

  try {
    const rows: Array<{ date: Date; count: bigint }> = await prisma.$queryRawUnsafe(
      `SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS count
       FROM page_views
       WHERE created_at >= $1
       GROUP BY 1
       ORDER BY 1 ASC`,
      start,
    )

    const map = new Map<string, number>()
    for (const r of rows) {
      const key = new Date(r.date).toISOString().slice(0, 10)
      map.set(key, Number(r.count))
    }

    const out: Array<{ date: string; count: number }> = []
    for (let i = 0; i < days; i++) {
      const d = startOfDay(new Date(start.getTime() + i * 24 * 60 * 60 * 1000))
      const key = d.toISOString().slice(0, 10)
      out.push({ date: key, count: map.get(key) ?? 0 })
    }
    return out
  } catch {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: 0,
    }))
  }
}

export async function topPages(days: number, limit = 8): Promise<Array<{ path: string; count: number }>> {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  try {
    const rows: Array<{ path: string; count: bigint }> = await prisma.$queryRawUnsafe(
      `SELECT path, COUNT(*) AS count
       FROM page_views
       WHERE created_at >= $1
       GROUP BY path
       ORDER BY count DESC
       LIMIT $2`,
      start,
      limit,
    )
    return rows.map(r => ({ path: r.path, count: Number(r.count) }))
  } catch {
    return []
  }
}

/** Count rows from a Prisma model with a `createdAt` field by day for sparkline display. */
export async function sparklineSeriesByCreatedAt(
  modelName: 'blogPost' | 'subscriber' | 'message' | 'client' | 'galleryItem',
  days: number,
): Promise<number[]> {
  const table =
    modelName === 'blogPost'
      ? 'blog_posts'
      : modelName === 'subscriber'
      ? 'subscribers'
      : modelName === 'message'
      ? 'messages'
      : modelName === 'client'
      ? 'clients'
      : 'gallery_items'

  const createdCol =
    modelName === 'subscriber' ? 'subscribed_at'
    : modelName === 'message'  ? 'received_at'
    : 'created_at'

  const start = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000))

  try {
    const rows: Array<{ day: Date; count: bigint }> = await prisma.$queryRawUnsafe(
      `SELECT DATE_TRUNC('day', ${createdCol}) AS day, COUNT(*) AS count
       FROM ${table}
       WHERE ${createdCol} >= $1
       GROUP BY 1
       ORDER BY 1 ASC`,
      start,
    )
    const map = new Map<string, number>()
    for (const r of rows) {
      const key = new Date(r.day).toISOString().slice(0, 10)
      map.set(key, Number(r.count))
    }
    return Array.from({ length: days }, (_, i) => {
      const d = startOfDay(new Date(start.getTime() + i * 24 * 60 * 60 * 1000))
      return map.get(d.toISOString().slice(0, 10)) ?? 0
    })
  } catch {
    return new Array(days).fill(0)
  }
}
