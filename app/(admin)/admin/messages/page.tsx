import { prisma } from '@/lib/data/db'
import type { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CollectionToolbar } from '@/components/admin/CollectionToolbar'
import { Pagination } from '@/components/admin/Pagination'
import { Inbox } from '@/components/admin/Inbox'
export const metadata: Metadata = { title: 'Messages · Studio' }
export const dynamic = 'force-dynamic'
export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const query =
    typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const status = ['unread', 'archived'].includes(params.status || '')
    ? params.status!
    : 'all'
  const where: Prisma.MessageWhereInput = {
    archived: status === 'archived',
    ...(status === 'unread' ? { read: false } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [total, all, unread, archived] = await Promise.all([
    prisma.message.count({ where }),
    prisma.message.count({ where: { archived: false } }),
    prisma.message.count({ where: { archived: false, read: false } }),
    prisma.message.count({ where: { archived: true } }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / 20))
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  )
  const messages = await prisma.message.findMany({
    where,
    orderBy: { receivedAt: 'desc' },
    skip: (page - 1) * 20,
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      body: true,
      read: true,
      archived: true,
      receivedAt: true,
    },
  })
  const base = new URLSearchParams()
  if (query) base.set('q', query)
  if (status !== 'all') base.set('status', status)
  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Conversations from the people who find their way here."
      />
      <CollectionToolbar
        basePath="/admin/messages"
        query={query}
        status={status}
        label="Messages"
        filters={[
          { value: 'all', label: 'Inbox', count: all },
          { value: 'unread', label: 'Unread', count: unread },
          { value: 'archived', label: 'Archived', count: archived },
        ]}
      />
      <Inbox messages={messages} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/admin/messages${base.size ? `?${base}` : ''}`}
      />
    </div>
  )
}
