import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PressManager } from '@/components/admin/PressManager'
import { Pagination } from '@/components/admin/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Press & Recognition — Admin' }

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminPressPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    prisma.pressItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
    prisma.pressItem.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <AdminPageHeader
        title="Press & Recognition"
        description="Manage essays, articles, awards, and speaking engagements."
      />
      <PressManager initialItems={items} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/press" />
    </div>
  )
}
