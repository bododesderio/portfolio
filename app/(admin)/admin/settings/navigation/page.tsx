import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { NavigationEditor, type NavLink } from '@/components/admin/settings/NavigationEditor'
import { getSiteSetting } from '@/lib/content'

export const metadata = { title: 'Navigation — Admin' }

export default async function NavigationPage() {
  const raw = await getSiteSetting('nav.links')
  let links: NavLink[] | null = null
  if (raw) {
    try {
      links = JSON.parse(raw) as NavLink[]
    } catch {
      links = null
    }
  }

  return (
    <div>
      <AdminPageHeader title="Navigation" description="Customise your public-site menu." />
      <NavigationEditor initialLinks={links} />
    </div>
  )
}
