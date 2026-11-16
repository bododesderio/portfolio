import type { Metadata } from 'next'
import { Eye, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { VisitsChart } from '@/components/admin/dashboard/VisitsChart'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { EmailStatsCard } from '@/components/admin/dashboard/EmailStatsCard'
import { countWithDelta, dailyPageViews, topPages } from '@/lib/data/analytics'
import { globalEmailStats } from '@/lib/domain/email-tracking'
export const metadata: Metadata = { title: 'Site activity' }
export const dynamic = 'force-dynamic'
export default async function AnalyticsPage() {
  const start = new Date(Date.now() - 30 * 86400000)
  const [
    visits,
    visits7,
    visits30,
    visits90,
    topList,
    totalViews,
    unique,
    referrers,
    emailStats,
  ] = await Promise.all([
    countWithDelta(30),
    dailyPageViews(7),
    dailyPageViews(30),
    dailyPageViews(90),
    topPages(30, 10),
    prisma.pageView.count(),
    prisma.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT COUNT(DISTINCT session_id) AS count FROM page_views WHERE created_at >= ${start}`,
    prisma.$queryRaw<
      Array<{ referrer: string; count: bigint }>
    >`SELECT referrer, COUNT(*) AS count FROM page_views WHERE created_at >= ${start} AND referrer IS NOT NULL AND referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 8`,
    globalEmailStats(30),
  ])
  return (
    <div>
      <AdminPageHeader
        title="Site activity"
        description="A closer look at how people discover and read your archive. Page views are recorded when visitors consent."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Views · 30 days" value={visits.current} icon={Eye} />
        <KpiCard
          label="Visitors · 30 days"
          value={Number(unique[0]?.count || 0)}
          icon={Users}
        />
        <KpiCard
          label="Change · 30 days"
          value={`${visits.delta > 0 ? '+' : ''}${visits.delta}%`}
          icon={TrendingUp}
        />
        <KpiCard
          label="All recorded views"
          value={totalViews}
          icon={BarChart3}
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <VisitsChart data7={visits7} data30={visits30} data90={visits90} />
        </div>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Popular pages · 30 days</h2>
          </div>
          <div className="admin-analytics-rows">
            {topList.length ? (
              topList.map((page) => (
                <div key={page.path}>
                  <span>{page.path}</span>
                  <strong>{page.count.toLocaleString()}</strong>
                </div>
              ))
            ) : (
              <p className="admin-empty">No recorded visits yet.</p>
            )}
          </div>
        </section>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Referrers · 30 days</h2>
          </div>
          <div className="admin-analytics-rows">
            {referrers.length ? (
              referrers.map((row) => (
                <div key={row.referrer}>
                  <span>{row.referrer}</span>
                  <strong>{Number(row.count).toLocaleString()}</strong>
                </div>
              ))
            ) : (
              <p className="admin-empty">
                Referrers will appear when visitors arrive from other sites.
              </p>
            )}
          </div>
        </section>
        <EmailStatsCard stats={emailStats} />
      </div>
    </div>
  )
}
