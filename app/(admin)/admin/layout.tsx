import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Login page overrides this layout via its own nested layout, and middleware
  // guards everything else. This fallback just renders children for any edge case.
  if (!session?.user?.email) {
    return <SessionProvider session={null}>{children}</SessionProvider>
  }

  const unreadMessageCount = await prisma.message
    .count({ where: { read: false, archived: false } })
    .catch(() => 0)

  return (
    <SessionProvider session={session}>
      <AdminShell
        email={session.user.email}
        themePreference={session.user.themePreference}
        unreadMessageCount={unreadMessageCount}
      >
        {children}
      </AdminShell>
    </SessionProvider>
  )
}
