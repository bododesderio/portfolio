import { auth } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ThemePreferenceSection } from '@/components/admin/account/ThemePreferenceSection'
import type { ThemePreference } from '@/lib/auth'

export const metadata = { title: 'Preferences — Admin' }

export default async function PreferencesPage() {
  const session = await auth()
  const pref = (session?.user?.themePreference ?? 'system') as ThemePreference

  return (
    <div>
      <AdminPageHeader title="Preferences" description="Your personal admin settings." />
      <div className="space-y-6 max-w-2xl">
        <ThemePreferenceSection initial={pref} />
        <div className="rounded-2xl border border-hairline bg-card p-6">
          <h2 className="font-serif text-lg text-fg mb-1">More coming</h2>
          <p className="text-sm text-fg-muted">Timezone, notification channels, and keyboard shortcuts will land here.</p>
        </div>
      </div>
    </div>
  )
}
