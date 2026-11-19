'use client'

import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { AdminBreadcrumbs } from './AdminBreadcrumbs'
import { AdminSearch } from './AdminSearch'
import { AdminQuickCreate } from './AdminQuickCreate'
import { AdminNotifications } from './AdminNotifications'
import { AdminProfileMenu } from './AdminProfileMenu'
import { AppearanceSettings } from '@/components/appearance/AppearanceSettings'
import { FullscreenToggle } from '@/components/appearance/FullscreenToggle'

/** Three columns so the search sits in the true centre whatever the side widths are. */
export function AdminTopBar({
  unreadNotificationCount,
  onOpenMobileSidebar,
  name,
  email,
}: {
  unreadNotificationCount: number
  onOpenMobileSidebar: () => void
  name: string
  email: string
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <header className="admin-topbar sticky top-0 z-20 bg-card border-b border-hairline">
      <div className="admin-topbar-grid">
        <div className="admin-topbar-start">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="admin-icon-button admin-topbar-menu"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="admin-breadcrumbs hidden lg:block min-w-0">
            <AdminBreadcrumbs />
          </div>
        </div>
        <div className="admin-topbar-search">
          <AdminSearch />
        </div>
        <div className="admin-topbar-end">
          <button
            type="button"
            className="admin-icon-button admin-topbar-search-toggle"
            aria-label={searchOpen ? 'Close search' : 'Search the workspace'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
          <AdminQuickCreate />
          <FullscreenToggle />
          <AppearanceSettings />
          <AdminNotifications initialUnread={unreadNotificationCount} />
          <AdminProfileMenu name={name} email={email} />
        </div>
      </div>
      {searchOpen && (
        <div className="admin-topbar-search-row">
          <AdminSearch />
        </div>
      )}
    </header>
  )
}
