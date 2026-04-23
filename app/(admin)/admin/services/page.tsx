import { prisma } from '@/lib/db'
import { ServicesManager } from '@/components/admin/ServicesManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services — Admin' }

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Services</h1>
      <ServicesManager initialServices={services} />
    </div>
  )
}
