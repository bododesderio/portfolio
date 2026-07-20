import { prisma } from '@/lib/data/db'
import { format } from 'date-fns'
import { globalEmailStats } from '@/lib/domain/email-tracking'
import { EmailStatsCard } from '@/components/admin/dashboard/EmailStatsCard'
import { Pagination } from '@/components/admin/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Email Logs — Admin' }
export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  bounced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const TYPE_LABELS: Record<string, string> = {
  campaign: 'Campaign',
  welcome: 'Welcome',
  contact_reply: 'Auto-reply',
  admin_notify: 'Admin Alert',
  new_post: 'New Post',
  digest: 'Digest',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function EmailLogsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const [logs, total, stats] = await Promise.all([
    prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      skip,
      take: pageSize,
      include: { _count: { select: { events: true } } },
    }),
    prisma.emailLog.count(),
    globalEmailStats(30),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-fg">Email Logs</h1>
        <p className="text-sm text-fg-muted mt-1">Every email sent by the system, with open and click tracking.</p>
      </div>

      <div className="mb-8">
        <EmailStatsCard stats={stats} />
      </div>

      <div className="bg-card rounded-2xl border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-fg-muted text-xs">
                <th className="text-left py-3 px-4 font-medium">Recipient</th>
                <th className="text-left py-3 px-4 font-medium">Subject</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Opened</th>
                <th className="text-left py-3 px-4 font-medium">Clicked</th>
                <th className="text-left py-3 px-4 font-medium">Events</th>
                <th className="text-right py-3 px-4 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-hairline last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 text-fg">{log.to}</td>
                  <td className="py-3 px-4 text-fg truncate max-w-[200px]">{log.subject}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-fg-muted">{TYPE_LABELS[log.type] || log.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[log.status] || 'bg-muted text-fg-muted'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-fg-muted">
                    {log.openedAt ? format(new Date(log.openedAt), 'MMM d, h:mm a') : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-fg-muted">
                    {log.clickedAt ? format(new Date(log.clickedAt), 'MMM d, h:mm a') : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-fg-muted text-center">{log._count.events}</td>
                  <td className="py-3 px-4 text-xs text-fg-muted text-right">
                    {format(new Date(log.sentAt), 'MMM d, h:mm a')}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-fg-muted text-sm">No emails sent yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/email-logs" />
    </div>
  )
}
