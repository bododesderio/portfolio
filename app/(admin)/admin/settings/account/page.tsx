import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PasswordChangeForm } from '@/components/admin/account/PasswordChangeForm'
import { ThemePreferenceSection } from '@/components/admin/account/ThemePreferenceSection'
import type { ThemePreference } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account — Admin' }

export default async function AccountPage() {
  const session = await auth()
  const pref = (session?.user?.themePreference ?? 'system') as ThemePreference
  const me = session?.user?.email
    ? await prisma.adminUser.findUnique({ where: { email: session.user.email } }).catch(() => null)
    : null

  return (
    <div>
      <AdminPageHeader title="Account" description="Profile, security, and preferences." />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Profile card */}
          <div className="rounded-2xl border border-hairline bg-card p-6">
            <h2 className="font-serif text-lg text-fg mb-4">Profile</h2>
            <div className="space-y-3">
              <Row label="Email" value={me?.email ?? '\u2014'} />
              <Row label="Member since" value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : '\u2014'} />
              <Row label="Last sign-in" value={me?.lastLogin ? new Date(me.lastLogin).toLocaleString() : 'Never'} />
            </div>
          </div>

          {/* Theme preference */}
          <ThemePreferenceSection initial={pref} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Password */}
          <div className="rounded-2xl border border-hairline bg-card p-6">
            <h2 className="font-serif text-lg text-fg mb-4">Change password</h2>
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-hairline last:border-0">
      <span className="text-xs uppercase tracking-widest text-fg-muted">{label}</span>
      <span className="text-sm text-fg">{value}</span>
    </div>
  )
}
