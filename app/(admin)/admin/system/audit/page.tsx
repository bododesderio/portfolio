import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { basePrisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CollectionToolbar } from '@/components/admin/CollectionToolbar'
import { Pagination } from '@/components/admin/Pagination'
import { AuditChanges } from '@/components/admin/system/AuditChanges'

export const metadata: Metadata = { title: 'Audit trail · Studio' }
export const dynamic = 'force-dynamic'
const PAGE_SIZE = 30
const DAY = 86_400_000

const AREAS: Record<string, { label: string; entities: string[] }> = {
  writing: { label: 'Writing', entities: ['BlogPost'] },
  work: { label: 'Work', entities: ['Project', 'ProjectImage'] },
  pages: { label: 'Pages', entities: ['SiteContent', 'HeroImage', 'PageEmbed'] },
  media: { label: 'Media', entities: ['Media', 'GalleryItem'] },
  audience: { label: 'Audience', entities: ['Message', 'Subscriber', 'NewsletterCampaign'] },
  website: { label: 'Website', entities: ['Service', 'Testimonial', 'Client', 'Banner', 'PressItem'] },
  settings: { label: 'Settings', entities: ['SiteSettings', 'SeoSettings', 'AppConfig', 'AdminUser'] },
  signins: { label: 'Sign-ins', entities: ['Session'] },
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  bulk_update: 'Bulk update',
  bulk_delete: 'Bulk delete',
  sign_in: 'Signed in',
  sign_in_failed: 'Failed sign-in',
}

const stamp = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kampala',
})

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  // Retention: failed sign-ins are noise after 90 days; everything else is kept for two years.
  await Promise.all([
    basePrisma.auditLog.deleteMany({
      where: { action: 'sign_in_failed', createdAt: { lt: new Date(Date.now() - 90 * DAY) } },
    }),
    basePrisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 730 * DAY) } } }),
  ])
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const area = params.status && AREAS[params.status] ? params.status : 'all'
  const where: Prisma.AuditLogWhereInput = {
    ...(area !== 'all' ? { entity: { in: AREAS[area].entities } } : {}),
    ...(query
      ? {
          OR: [
            { summary: { contains: query, mode: 'insensitive' } },
            { actorEmail: { contains: query, mode: 'insensitive' } },
            { ip: { contains: query } },
          ],
        }
      : {}),
  }
  const [total, failedRecently] = await Promise.all([
    basePrisma.auditLog.count({ where }),
    basePrisma.auditLog.count({
      where: { action: 'sign_in_failed', createdAt: { gte: new Date(Date.now() - DAY) } },
    }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(params.page || '1', 10) || 1))
  const entries = await basePrisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })
  const base = new URLSearchParams()
  if (query) base.set('q', query)
  if (area !== 'all') base.set('status', area)
  return (
    <div>
      <AdminPageHeader
        title="Audit trail"
        description="Every change made from the admin, who made it and from which address. Passwords, keys and tokens are never stored here."
      />
      {failedRecently >= 5 && (
        <p className="admin-callout" data-tone="warning" role="status">
          {failedRecently} failed sign-in attempts in the last 24 hours. Filter by Sign-ins to see the addresses.
        </p>
      )}
      <CollectionToolbar
        basePath="/admin/system/audit"
        query={query}
        status={area}
        label="Audit trail"
        filters={[
          { value: 'all', label: 'Everything' },
          ...Object.entries(AREAS).map(([value, { label }]) => ({ value, label })),
        ]}
      />
      <section className="admin-panel">
        {entries.length === 0 ? (
          <p className="admin-empty">
            {query || area !== 'all' ? 'No changes match this filter.' : 'Changes you make in the admin will be listed here.'}
          </p>
        ) : (
          <ol className="admin-audit">
            {entries.map((entry) => (
              <li key={entry.id}>
                <details>
                  <summary>
                    <time dateTime={entry.createdAt.toISOString()}>{stamp.format(entry.createdAt)}</time>
                    <span className="admin-audit-summary">
                      <strong>{entry.summary}</strong>
                      <small>
                        {entry.actorEmail}
                        {entry.ip ? ` · ${entry.ip}` : ''}
                      </small>
                    </span>
                    <span className="admin-status" data-status={entry.action}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                  </summary>
                  <AuditChanges action={entry.action} changes={entry.changes} />
                </details>
              </li>
            ))}
          </ol>
        )}
      </section>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/admin/system/audit${base.size ? `?${base}` : ''}`}
      />
    </div>
  )
}
