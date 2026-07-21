import Link from 'next/link'
import { FileText, Mail, MessageSquare, Users, ImageIcon, BarChart3, Eye, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { VisitsChart } from '@/components/admin/dashboard/VisitsChart'
import { QuickActions } from '@/components/admin/dashboard/QuickActions'
import { EmailStatsCard } from '@/components/admin/dashboard/EmailStatsCard'
import {
  countWithDelta,
  dailyPageViews,
  sparklineSeriesByCreatedAt,
  topPages,
} from '@/lib/data/analytics'
import { globalEmailStats } from '@/lib/domain/email-tracking'

export const metadata: Metadata = { title: 'Overview — Admin' }
export const dynamic = 'force-dynamic'

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

export default async function AdminDashboard() {
  const [
    postsCount,
    subsCount,
    unreadCount,
    clientsCount,
    galleryCount,
    visits,
    delta7,
    postsSeries,
    subsSeries,
    msgsSeries,
    clientsSeries,
    gallerySeries,
    visits7, visits30, visits90,
    topList,
    recentMessages,
    recentSubscribers,
    recentPosts,
    totalViews,
    todayViews,
    referrers,
    emailStats,
  ] = await Promise.all([
    prisma.blogPost.count().catch(() => 0),
    prisma.subscriber.count({ where: { confirmed: true } }).catch(() => 0),
    prisma.message.count({ where: { read: false, archived: false } }).catch(() => 0),
    prisma.client.count().catch(() => 0),
    prisma.galleryItem.count().catch(() => 0),
    countWithDelta(30),
    countWithDelta(7),
    sparklineSeriesByCreatedAt('blogPost', 30),
    sparklineSeriesByCreatedAt('subscriber', 30),
    sparklineSeriesByCreatedAt('message', 30),
    sparklineSeriesByCreatedAt('client', 30),
    sparklineSeriesByCreatedAt('galleryItem', 30),
    dailyPageViews(7),
    dailyPageViews(30),
    dailyPageViews(90),
    topPages(30, 15),
    prisma.message.findMany({ where: { archived: false }, orderBy: { receivedAt: 'desc' }, take: 5 }).catch(() => []),
    prisma.subscriber.findMany({ orderBy: { subscribedAt: 'desc' }, take: 5 }).catch(() => []),
    prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }).catch(() => []),
    prisma.pageView.count().catch(() => 0),
    prisma.pageView.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }).catch(() => 0),
    getTopReferrers(30, 10),
    globalEmailStats(30),
  ])

  const uniqueSessions30 = await prisma.pageView
    .groupBy({ by: ['sessionId'], where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } })
    .then(r => r.length)
    .catch(() => 0)

  return (
    <div>
      <AdminPageHeader title="Overview" description="Everything at a glance." />

      {/* Content KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard label="Blog Posts"        value={postsCount}       series={postsSeries}    icon={FileText}       href="/admin/blog"        tone="brand" />
        <KpiCard label="Subscribers"       value={subsCount}        series={subsSeries}     icon={Mail}           href="/admin/newsletter"  tone="emerald" />
        <KpiCard label="Unread Messages"   value={unreadCount}      series={msgsSeries}     icon={MessageSquare}  href="/admin/messages"    tone="amber" />
        <KpiCard label="Clients"           value={clientsCount}     series={clientsSeries}  icon={Users}          href="/admin/clients"     tone="sky" />
        <KpiCard label="Gallery Items"     value={galleryCount}     series={gallerySeries}  icon={ImageIcon}      href="/admin/media"       tone="violet" />
        <KpiCard label="Site Visits (30d)" value={visits.current.toLocaleString()} delta={visits.delta} icon={BarChart3} tone="rose" />
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Today" value={todayViews} icon={Eye} tone="brand" />
        <KpiCard label="Last 7 days" value={delta7.current} delta={delta7.delta} icon={TrendingUp} tone="emerald" />
        <KpiCard label="Last 30 days" value={visits.current} delta={visits.delta} icon={BarChart3} tone="sky" />
        <KpiCard label="All time" value={totalViews.toLocaleString()} icon={FileText} tone="violet" />
      </div>

      {/* Visits chart + top pages */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <VisitsChart data7={visits7} data30={visits30} data90={visits90} />
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h2 className="font-serif text-lg text-fg mb-4">Top pages (30d)</h2>
          {topList.length === 0 ? (
            <p className="text-sm text-fg-muted">No data yet.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {topList.map((p, i) => {
                const maxCount = topList[0]?.count || 1
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
      </div>

      {/* Referrers + Unique visitors */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h2 className="font-serif text-lg text-fg mb-4">Top referrers (30d)</h2>
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
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h2 className="font-serif text-lg text-fg mb-1">Unique visitors</h2>
          <p className="text-xs text-fg-muted mb-4">Last 30 days (by session)</p>
          <p className="font-serif text-4xl tabular text-fg">{uniqueSessions30.toLocaleString()}</p>
        </div>
      </div>

      {/* Email performance */}
      <div className="mb-6">
        <EmailStatsCard stats={emailStats} />
      </div>

      {/* Activity feed */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <ActivityCard title="Recent Messages" viewHref="/admin/messages">
          {recentMessages.length === 0 ? <Empty /> : recentMessages.map(m => (
            <ActivityRow key={m.id} primary={m.subject} secondary={m.name} date={m.receivedAt} highlight={!m.read} />
          ))}
        </ActivityCard>
        <ActivityCard title="Recent Subscribers" viewHref="/admin/newsletter">
          {recentSubscribers.length === 0 ? <Empty /> : recentSubscribers.map(s => (
            <ActivityRow key={s.id} primary={s.email} secondary={s.name ?? undefined} date={s.subscribedAt} />
          ))}
        </ActivityCard>
        <ActivityCard title="Recent Blog Activity" viewHref="/admin/blog">
          {recentPosts.length === 0 ? <Empty /> : recentPosts.map(p => (
            <ActivityRow key={p.id} primary={p.title} secondary={p.status} date={p.updatedAt} />
          ))}
        </ActivityCard>
      </div>

      <QuickActions />
    </div>
  )
}

function ActivityCard({ title, viewHref, children }: { title: string; viewHref: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-base text-fg">{title}</h2>
        <Link href={viewHref} className="text-xs text-brand hover:underline">View all</Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ActivityRow({ primary, secondary, date, highlight }: { primary: string; secondary?: string; date: Date; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-hairline last:border-0">
      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${highlight ? 'font-medium text-fg' : 'text-fg'}`}>{primary}</p>
        {secondary && <p className="text-xs text-fg-muted truncate">{secondary}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
        {highlight && <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-label="Unread" />}
        <time className="text-[11px] text-fg-muted font-mono">
          {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </time>
      </div>
    </div>
  )
}

function Empty() {
  return <p className="text-sm text-fg-muted py-4 text-center">Nothing yet.</p>
}
