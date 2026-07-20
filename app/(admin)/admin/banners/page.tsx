import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BannersManager } from '@/components/admin/BannersManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Banners & Popups — Admin' }

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ enabled: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <AdminPageHeader
        title="Banners & Popups"
        description="Announcement bars, cookie consent, modals, and corner popups. Create, schedule, and target banners to specific pages and devices."
      />
      <BannersManager initial={JSON.parse(JSON.stringify(banners))} />
    </div>
  )
}
