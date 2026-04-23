import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { SiteSettingsForm } from '@/components/admin/settings/SiteSettingsForm'
import { SeoSettingsForm } from '@/components/admin/settings/SeoSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Site & SEO — Admin' }

export default async function SiteSettingsPage() {
  const [settingsRows, seoPages] = await Promise.all([
    prisma.siteSettings.findMany(),
    prisma.seoSettings.findMany(),
  ])

  const settings: Record<string, string> = {}
  for (const r of settingsRows) settings[r.key] = r.value

  return (
    <div>
      <AdminPageHeader title="Site & SEO" description="Name, tagline, social links, and per-page meta tags." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-serif text-lg text-fg mb-4">General</h2>
          <SiteSettingsForm initialSettings={settings} />
        </div>
        <div>
          <h2 className="font-serif text-lg text-fg mb-4">SEO & meta tags</h2>
          <SeoSettingsForm pages={seoPages} />
        </div>
      </div>
    </div>
  )
}
