'use client'

import { Menu } from 'lucide-react'
import { AdminBreadcrumbs } from './AdminBreadcrumbs'
import { AdminSearch } from './AdminSearch'
import { AdminQuickCreate } from './AdminQuickCreate'
import { AdminNotifications } from './AdminNotifications'
import { AppearanceSettings } from '@/components/appearance/AppearanceSettings'
import { FullscreenToggle } from '@/components/appearance/FullscreenToggle'

export function AdminTopBar({
  unreadMessageCount,
  onOpenMobileSidebar,
}: {
  unreadMessageCount: number
  onOpenMobileSidebar: () => void
}) {
  return (
    <header className="admin-topbar sticky top-0 z-20 h-16 bg-card border-b border-hairline">
      <div className="h-full flex items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-fg-muted hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="admin-breadcrumbs hidden lg:block flex-shrink-0 min-w-0">
          <AdminBreadcrumbs />
        </div>

        <div className="admin-search-wrap flex-1 max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <AdminSearch />
        </div>

        <div className="flex items-center gap-1.5">
          <AdminQuickCreate />
          <FullscreenToggle />
          <AppearanceSettings />
          <AdminNotifications unreadCount={unreadMessageCount} />
        </div>
      </div>
    </header>
  )
}
