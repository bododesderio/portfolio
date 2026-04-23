import { getAllConfig } from '@/lib/config'
import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { IntegrationsForm } from '@/components/admin/settings/IntegrationsForm'

export const metadata = { title: 'Integrations — Admin' }

export default async function IntegrationsPage() {
  const config = await getAllConfig()

  // Load analytics toggle from SiteSettings.
  const analyticsRow = await prisma.siteSettings.findUnique({ where: { key: 'admin.analytics_enabled' } }).catch(() => null)
  const analyticsEnabled = analyticsRow?.value !== 'false'

  return (
    <div>
      <AdminPageHeader title="Integrations" description="API credentials and third-party switches." />
      <IntegrationsForm config={config} analyticsEnabled={analyticsEnabled} />
    </div>
  )
}
