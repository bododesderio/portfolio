import { prisma } from '@/lib/db'
import { ClientsManager } from '@/components/admin/ClientsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Clients — Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function ClientsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      orderBy: { order: 'asc' },
      include: { logo: { select: { id: true, url: true, filename: true } } },
      skip,
      take: pageSize,
    }),
    prisma.client.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <AdminPageHeader title="Clients" description={`${total} client${total === 1 ? '' : 's'}`} />
      <ClientsManager initialClients={clients.map(c => ({
        id: c.id,
        name: c.name,
        website: c.website,
        visible: c.visible,
        order: c.order,
        logoUrl: c.logo?.url ?? null,
        logoMediaId: c.logoMediaId,
      }))} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/clients" />
    </div>
  )
}
