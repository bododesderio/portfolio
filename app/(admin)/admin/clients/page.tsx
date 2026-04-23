import { prisma } from '@/lib/db'
import { ClientsManager } from '@/components/admin/ClientsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Clients — Admin' }

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Clients</h1>
      <ClientsManager initialClients={clients} />
    </div>
  )
}
