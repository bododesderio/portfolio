import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PressManager } from '@/components/admin/PressManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Press & Recognition — Admin' }

export default async function AdminPressPage() {
  const items = await prisma.pressItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <AdminPageHeader
        title="Press & Recognition"
        description="Manage essays, articles, awards, and speaking engagements."
      />
      <PressManager initialItems={items} />
    </div>
  )
}
