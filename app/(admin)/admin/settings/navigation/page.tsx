import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { NavigationEditor, type NavLink } from '@/components/admin/settings/NavigationEditor'
import { getSiteSetting } from '@/lib/data/content'
import { HeaderBehaviorSetting } from '@/components/admin/settings/HeaderBehaviorSetting'
import { HEADER_BEHAVIOR_KEY, readHeaderBehavior } from '@/lib/domain/header-behavior'

export const metadata = { title: 'Navigation | Admin' }

export default async function NavigationPage() {
  const [raw, headerBehavior] = await Promise.all([
    getSiteSetting('nav.links'),
    getSiteSetting(HEADER_BEHAVIOR_KEY).then(readHeaderBehavior),
  ])
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
      <AdminPageHeader
        title="Navigation"
        description="The links in the public site menu, and how the header behaves while visitors scroll."
      />
      <div className="admin-stack">
        <HeaderBehaviorSetting initial={headerBehavior} />
        <NavigationEditor initialLinks={links} />
      </div>
    </div>
  )
}
