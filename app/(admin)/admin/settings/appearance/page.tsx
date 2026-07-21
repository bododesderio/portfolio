import { prisma } from '@/lib/data/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { LoginBackgroundCard } from '@/components/admin/settings/LoginBackgroundCard'
import { BrandColorCard } from '@/components/admin/settings/BrandColorCard'
import { AvailabilityCard } from '@/components/admin/settings/AvailabilityCard'

export const metadata = { title: 'Appearance — Admin' }

export default async function AppearancePage() {
  const rows = await prisma.siteSettings.findMany()
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value

  const availabilityRows = await prisma.siteContent.findMany({
    where: { page: 'home', section: 'availability' },
  })
  const availabilityMap = new Map(availabilityRows.map(r => [r.fieldKey, r]))
  const availability = availabilityRows.length
    ? {
        status: availabilityMap.get('status')?.value ?? 'available',
        label: availabilityMap.get('label')?.value ?? '',
        note: availabilityMap.get('note')?.value ?? '',
      }
    : null

  return (
    <div>
      <AdminPageHeader
        title="Appearance"
        description="Brand expression: colour, availability badge, and the admin login background."
      />
      <div className="space-y-6">
        <BrandColorCard initialBrand={settings['theme.brand_color'] || '#C9A84C'} />
        <LoginBackgroundCard initial={{
          login_background_url: settings['login_background_url'] || '',
          login_card_image: settings['login_card_image'] || '',
          login_heading: settings['login_heading'] || 'Welcome Back',
          login_subtitle: settings['login_subtitle'] || 'Sign in to your admin account',
          login_overlay_title: settings['login_overlay_title'] || 'Bodo Desderio',
          login_overlay_subtitle: settings['login_overlay_subtitle'] || 'Building the future, one project at a time.',
        }} />
        {availability && <AvailabilityCard initial={availability} />}
      </div>
    </div>
  )
}
