'use client'

import { Menu } from 'lucide-react'
import { AdminBreadcrumbs } from './AdminBreadcrumbs'
import { AdminSearch } from './AdminSearch'
import { AdminQuickCreate } from './AdminQuickCreate'
import { AdminThemeSelector } from './AdminThemeSelector'
import { AdminNotifications } from './AdminNotifications'
import type { ThemePreference } from '@/lib/auth'

export function AdminTopBar({
  email,
  themePreference,
  unreadMessageCount,
  onOpenMobileSidebar,
}: {
  email: string
  themePreference: ThemePreference
  unreadMessageCount: number
  onOpenMobileSidebar: () => void
}) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-xl border-b border-hairline">
      <div className="h-full flex items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-fg-muted hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block flex-shrink-0 min-w-0">
          <AdminBreadcrumbs />
        </div>

        <div className="flex-1 max-w-md mx-auto md:mx-0 md:ml-auto">
          <AdminSearch />
        </div>

        <div className="flex items-center gap-1.5">
          <AdminQuickCreate />
          <AdminThemeSelector initial={themePreference} />
          <AdminNotifications unreadCount={unreadMessageCount} />
          <div className="hidden sm:block w-px h-6 bg-hairline mx-1" />
          <UserBadge email={email} />
        </div>
      </div>
    </header>
  )
}

function UserBadge({ email }: { email: string }) {
  const letter = (email || '?')[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-white text-[12px] font-semibold"
      title={email}
    >
      {letter}
    </div>
  )
}
