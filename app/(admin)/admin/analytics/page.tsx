import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { VisitsChart } from '@/components/admin/dashboard/VisitsChart'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { countWithDelta, dailyPageViews, topPages } from '@/lib/analytics'
import { prisma } from '@/lib/db'
import { BarChart3, Eye, FileText, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics — Admin' }
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [
    visits7,
    visits30,
    visits90,
    delta7,
    delta30,
    topList30,
    totalViews,
    todayViews,
    referrers,
  ] = await Promise.all([
    dailyPageViews(7),
    dailyPageViews(30),
    dailyPageViews(90),
    countWithDelta(7),
    countWithDelta(30),
    topPages(30, 15),
    prisma.pageView.count().catch(() => 0),
    prisma.pageView.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }).catch(() => 0),
    getTopReferrers(30, 10),
  ])

  const uniqueSessions30 = await prisma.pageView
    .groupBy({ by: ['sessionId'], where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } })
    .then(r => r.length)
    .catch(() => 0)

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="First-party page-view tracking. Privacy-first, no third-party scripts."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Today" value={todayViews} icon={Eye} tone="brand" />
        <KpiCard label="Last 7 days" value={delta7.current} delta={delta7.delta} icon={TrendingUp} tone="emerald" />
        <KpiCard label="Last 30 days" value={delta30.current} delta={delta30.delta} icon={BarChart3} tone="sky" />
        <KpiCard label="All time" value={totalViews.toLocaleString()} icon={FileText} tone="violet" />
      </div>

      {/* Visits chart */}
      <div className="mb-6">
        <VisitsChart data7={visits7} data30={visits30} data90={visits90} />
      </div>

      {/* Bottom grid: top pages + referrers + unique visitors */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top pages */}
        <div className="lg:col-span-2 rounded-2xl border border-hairline bg-card p-5">
          <h2 className="font-serif text-lg text-fg mb-4">Top pages (30 days)</h2>
          {topList30.length === 0 ? (
            <p className="text-sm text-fg-muted py-4 text-center">No data yet. Visits appear after the public site receives traffic.</p>
          ) : (
            <div className="space-y-1">
              {topList30.map((p, i) => {
                const maxCount = topList30[0]?.count || 1
                const pct = Math.round((p.count / maxCount) * 100)
                return (
                  <div key={p.path} className="flex items-center gap-3 py-2">
                    <span className="w-6 text-xs text-fg-muted text-right font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm text-fg truncate">{p.path}</span>
                        <span className="text-xs font-mono text-fg-muted tabular flex-shrink-0">{p.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-brand/60" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Referrers + unique visitors */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-card p-5">
            <h2 className="font-serif text-lg text-fg mb-1">Unique visitors</h2>
            <p className="text-xs text-fg-muted mb-4">Last 30 days (by session)</p>
            <p className="font-serif text-4xl tabular text-fg">{uniqueSessions30.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-hairline bg-card p-5">
            <h2 className="font-serif text-lg text-fg mb-4">Top referrers (30 days)</h2>
            {referrers.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-4">No referrer data yet.</p>
            ) : (
              <ul className="space-y-2">
                {referrers.map(r => (
                  <li key={r.referrer} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-fg">{r.referrer}</span>
                    <span className="font-mono tabular text-fg-muted flex-shrink-0">{r.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

async function getTopReferrers(days: number, limit: number): Promise<Array<{ referrer: string; count: number }>> {
  const start = new Date(Date.now() - days * 86400000)
  try {
    const rows: Array<{ referrer: string; count: bigint }> = await prisma.$queryRawUnsafe(
      `SELECT referrer, COUNT(*) AS count
       FROM page_views
       WHERE created_at >= $1 AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT $2`,
      start,
      limit,
    )
    return rows.map(r => ({ referrer: r.referrer, count: Number(r.count) }))
  } catch {
    return []
  }
}
