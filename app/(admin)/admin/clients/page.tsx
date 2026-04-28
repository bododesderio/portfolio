import { prisma } from '@/lib/db'
import { ClientsManager } from '@/components/admin/ClientsManager'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Clients — Admin' }
export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { order: 'asc' },
    include: { logo: { select: { id: true, url: true, filename: true } } },
  })
  return (
    <div>
      <AdminPageHeader title="Clients" description={`${clients.length} client${clients.length === 1 ? '' : 's'}`} />
      <ClientsManager initialClients={clients.map(c => ({
        id: c.id,
        name: c.name,
        website: c.website,
        visible: c.visible,
        order: c.order,
        logoUrl: c.logo?.url ?? null,
        logoMediaId: c.logoMediaId,
      }))} />
    </div>
  )
}
