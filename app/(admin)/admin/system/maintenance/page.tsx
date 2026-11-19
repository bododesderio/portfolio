import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { MaintenanceForm } from '@/components/admin/system/MaintenanceForm'
import { clearMaintenanceCache, getMaintenanceState } from '@/lib/domain/maintenance'

export const metadata: Metadata = { title: 'Maintenance · Studio' }
export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
  clearMaintenanceCache()
  const state = await getMaintenanceState()
  return (
    <div>
      <AdminPageHeader
        title="Maintenance mode"
        description="While it is on, visitors get a short notice instead of the site and search engines are told to come back later. You keep full access while signed in."
      />
      <MaintenanceForm initial={state} />
    </div>
  )
}
