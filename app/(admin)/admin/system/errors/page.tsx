import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { basePrisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CollectionToolbar } from '@/components/admin/CollectionToolbar'
import { Pagination } from '@/components/admin/Pagination'
import { ErrorActions, ClearResolvedButton } from '@/components/admin/system/ErrorActions'
import { ERROR_STATUSES } from '@/lib/domain/error-reports'
import { timeAgo } from '@/components/admin/notifications/feed'

export const metadata: Metadata = { title: 'Error reports · Studio' }
export const dynamic = 'force-dynamic'
const PAGE_SIZE = 25
const SOURCE_LABELS: Record<string, string> = { public: 'Public site', admin: 'Admin', server: 'Server' }

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; id?: string }>
}) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const status = ERROR_STATUSES.includes(params.status as never) ? params.status! : 'open'
  const where: Prisma.ErrorReportWhereInput = {
    status,
    ...(query
      ? {
          OR: [
            { message: { contains: query, mode: 'insensitive' } },
            { path: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [total, grouped] = await Promise.all([
    basePrisma.errorReport.count({ where }),
    basePrisma.errorReport.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  const counts = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]))
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(params.page || '1', 10) || 1))
  const reports = await basePrisma.errorReport.findMany({
    where,
    orderBy: { lastSeenAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })
  const base = new URLSearchParams({ status })
  if (query) base.set('q', query)
  return (
    <div>
      <AdminPageHeader
        title="Error reports"
        description="Errors from visitors’ browsers, the admin and the server, grouped so a repeat adds to the count instead of a new row. A resolved error that happens again reopens and notifies you."
        actions={(counts.resolved ?? 0) > 0 ? <ClearResolvedButton count={counts.resolved} /> : undefined}
      />
      <CollectionToolbar
        basePath="/admin/system/errors"
        query={query}
        status={status === 'open' ? 'all' : status}
        label="Errors"
        filters={[
          { value: 'all', label: 'Open', count: counts.open ?? 0 },
          { value: 'resolved', label: 'Resolved', count: counts.resolved ?? 0 },
          { value: 'ignored', label: 'Ignored', count: counts.ignored ?? 0 },
        ]}
      />
      <section className="admin-panel">
        {reports.length === 0 ? (
          <p className="admin-empty">
            {status === 'open' && !query ? 'No open errors. New ones will appear here and in your notifications.' : 'No errors match this filter.'}
          </p>
        ) : (
          <ul className="admin-errors">
            {reports.map((report) => (
              <li key={report.id}>
                <details open={params.id === report.id}>
                  <summary>
                    <span className="admin-status" data-status={report.source}>
                      {SOURCE_LABELS[report.source] ?? report.source}
                    </span>
                    <span className="admin-error-summary">
                      <strong>{report.message}</strong>
                      <small>
                        {report.path || 'Unknown page'} · last seen {timeAgo(report.lastSeenAt)}
                      </small>
                    </span>
                    <span className="admin-error-count" aria-label={`${report.count} occurrences`}>
                      {report.count.toLocaleString()}×
                    </span>
                  </summary>
                  <div className="admin-error-detail">
                    <dl>
                      <div>
                        <dt>First seen</dt>
                        <dd>{report.firstSeenAt.toLocaleString('en-GB', { timeZone: 'Africa/Kampala' })}</dd>
                      </div>
                      <div>
                        <dt>Last seen</dt>
                        <dd>{report.lastSeenAt.toLocaleString('en-GB', { timeZone: 'Africa/Kampala' })}</dd>
                      </div>
                      {report.userAgent && (
                        <div>
                          <dt>Browser</dt>
                          <dd>{report.userAgent}</dd>
                        </div>
                      )}
                    </dl>
                    {report.stack ? <pre>{report.stack}</pre> : <p className="admin-audit-none">No stack trace was sent.</p>}
                    <ErrorActions id={report.id} status={report.status} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Pagination currentPage={page} totalPages={totalPages} basePath={`/admin/system/errors?${base}`} />
    </div>
  )
}
