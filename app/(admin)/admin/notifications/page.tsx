import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { basePrisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { NotificationList } from '@/components/admin/notifications/NotificationList'
import { NotificationBulkActions } from '@/components/admin/notifications/NotificationBulkActions'
import { NOTIFICATION_LABELS, NOTIFICATION_TYPES } from '@/lib/domain/admin-notifications'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Notifications · Studio' }
export const dynamic = 'force-dynamic'
const PAGE_SIZE = 30

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const filter =
    params.status === 'unread' || NOTIFICATION_TYPES.includes(params.status as never) ? params.status! : 'all'
  const where: Prisma.AdminNotificationWhereInput =
    filter === 'all' ? {} : filter === 'unread' ? { readAt: null } : { type: filter }
  const [total, unread, byType] = await Promise.all([
    basePrisma.adminNotification.count({ where }),
    basePrisma.adminNotification.count({ where: { readAt: null } }),
    basePrisma.adminNotification.groupBy({ by: ['type'], _count: { _all: true } }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(params.page || '1', 10) || 1))
  const items = await basePrisma.adminNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })
  const counts = Object.fromEntries(byType.map((row) => [row.type, row._count._all]))
  const filters = [
    { value: 'all', label: 'All', count: byType.reduce((sum, row) => sum + row._count._all, 0) },
    { value: 'unread', label: 'Unread', count: unread },
    ...NOTIFICATION_TYPES.filter((type) => counts[type]).map((type) => ({
      value: type,
      label: NOTIFICATION_LABELS[type],
      count: counts[type],
    })),
  ]
  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="New messages, confirmed subscribers, site errors and maintenance changes, newest first."
        actions={<NotificationBulkActions unread={unread} />}
      />
      <nav className="admin-filter-tabs admin-filter-tabs-standalone" aria-label="Notification filters">
        {filters.map((option) => (
          <Link
            key={option.value}
            href={option.value === 'all' ? '/admin/notifications' : `/admin/notifications?status=${option.value}`}
            aria-current={filter === option.value ? 'page' : undefined}
          >
            {option.label}
            <span className="admin-filter-count">{option.count}</span>
          </Link>
        ))}
      </nav>
      <section className="admin-panel">
        <NotificationList
          items={items.map((item) => ({
            ...item,
            readAt: item.readAt?.toISOString() ?? null,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </section>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={filter === 'all' ? '/admin/notifications' : `/admin/notifications?status=${filter}`}
      />
    </div>
  )
}
