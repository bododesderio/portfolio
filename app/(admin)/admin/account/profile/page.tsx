import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export const metadata = { title: 'Profile — Admin' }

export default async function ProfilePage() {
  const session = await auth()
  const me = session?.user?.email
    ? await prisma.adminUser.findUnique({ where: { email: session.user.email } }).catch(() => null)
    : null

  return (
    <div>
      <AdminPageHeader title="Profile" description="Your admin profile." />
      <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4 max-w-xl">
        <Row label="Email" value={me?.email ?? '—'} />
        <Row label="Member since" value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : '—'} />
        <Row label="Last sign-in" value={me?.lastLogin ? new Date(me.lastLogin).toLocaleString() : 'Never'} />
      </div>
      <p className="mt-6 text-xs text-fg-muted">
        Editing name and avatar coming soon. Change your password under{' '}
        <a href="/admin/account/security" className="text-brand hover:underline">Security</a>.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-hairline last:border-0">
      <span className="text-xs uppercase tracking-widest text-fg-muted">{label}</span>
      <span className="text-sm text-fg">{value}</span>
    </div>
  )
}
