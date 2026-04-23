import Link from 'next/link'
import { FileText, Mail, MessageSquare, Users, ImageIcon, BarChart3 } from 'lucide-react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { VisitsChart } from '@/components/admin/dashboard/VisitsChart'
import { QuickActions } from '@/components/admin/dashboard/QuickActions'
import {
  countWithDelta,
  dailyPageViews,
  sparklineSeriesByCreatedAt,
  topPages,
} from '@/lib/analytics'

export const metadata: Metadata = { title: 'Dashboard — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    postsCount,
    subsCount,
    unreadCount,
    clientsCount,
    galleryCount,
    visits,
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
  ] = await Promise.all([
    prisma.blogPost.count().catch(() => 0),
    prisma.subscriber.count({ where: { confirmed: true } }).catch(() => 0),
    prisma.message.count({ where: { read: false, archived: false } }).catch(() => 0),
    prisma.client.count().catch(() => 0),
    prisma.galleryItem.count().catch(() => 0),
    countWithDelta(30),
    sparklineSeriesByCreatedAt('blogPost', 30),
    sparklineSeriesByCreatedAt('subscriber', 30),
    sparklineSeriesByCreatedAt('message', 30),
    sparklineSeriesByCreatedAt('client', 30),
    sparklineSeriesByCreatedAt('galleryItem', 30),
    dailyPageViews(7),
    dailyPageViews(30),
    dailyPageViews(90),
    topPages(30, 8),
    prisma.message.findMany({ where: { archived: false }, orderBy: { receivedAt: 'desc' }, take: 5 }).catch(() => []),
    prisma.subscriber.findMany({ orderBy: { subscribedAt: 'desc' }, take: 5 }).catch(() => []),
    prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }).catch(() => []),
  ])

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Everything at a glance." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard label="Blog Posts"        value={postsCount}       series={postsSeries}    icon={FileText}       href="/admin/blog"        tone="brand" />
        <KpiCard label="Subscribers"       value={subsCount}        series={subsSeries}     icon={Mail}           href="/admin/newsletter"  tone="emerald" />
        <KpiCard label="Unread Messages"   value={unreadCount}      series={msgsSeries}     icon={MessageSquare}  href="/admin/messages"    tone="amber" />
        <KpiCard label="Clients"           value={clientsCount}     series={clientsSeries}  icon={Users}          href="/admin/clients"     tone="sky" />
        <KpiCard label="Gallery Items"     value={galleryCount}     series={gallerySeries}  icon={ImageIcon}      href="/admin/gallery"     tone="violet" />
        <KpiCard label="Site Visits (30d)" value={visits.current.toLocaleString()} delta={visits.delta} icon={BarChart3} href="/admin/analytics" tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <VisitsChart data7={visits7} data30={visits30} data90={visits90} />
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h2 className="font-serif text-lg text-fg mb-4">Top pages</h2>
          {topList.length === 0 ? (
            <p className="text-sm text-fg-muted">No data yet. Visits appear after the public site receives traffic.</p>
          ) : (
            <ul className="space-y-2">
              {topList.map(p => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-fg">{p.path}</span>
                  <span className="font-mono tabular text-fg-muted">{p.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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
