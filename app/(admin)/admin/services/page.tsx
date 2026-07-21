import { prisma } from '@/lib/data/db'
import { ServicesManager } from '@/components/admin/ServicesManager'
import { Pagination } from '@/components/admin/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services — Admin' }

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminServicesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      orderBy: { order: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.service.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Services</h1>
      <ServicesManager initialServices={services} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/services" />
    </div>
  )
}
