import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { AdminShell } from '@/components/admin/AdminShell'
import './admin.css'
import './operations.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Login page overrides this layout via its own nested layout, and middleware
  // guards everything else. This fallback just renders children for any edge case.
  if (!session?.user?.email) {
    return <SessionProvider session={null}>{children}</SessionProvider>
  }

  const countOrZero = (label: string, count: Promise<number>) =>
    count.catch((error) => {
      console.error(`[admin] could not count ${label}`, error)
      return 0
    })
  const [messages, notifications, errors, account] = await Promise.all([
    countOrZero('messages', prisma.message.count({ where: { read: false, archived: false } })),
    countOrZero('notifications', prisma.adminNotification.count({ where: { readAt: null } })),
    countOrZero('errors', prisma.errorReport.count({ where: { status: 'open' } })),
    prisma.adminUser
      .findUnique({ where: { email: session.user.email }, select: { name: true } })
      .catch((error) => {
        console.error('[admin] could not load the account name', error)
        return null
      }),
  ])

  return (
    <SessionProvider session={session}>
      <AdminShell
        email={session.user.email}
        name={account?.name || 'Bodo Desderio'}
        badges={{ messages, notifications, errors }}
      >
        {children}
      </AdminShell>
    </SessionProvider>
  )
}
