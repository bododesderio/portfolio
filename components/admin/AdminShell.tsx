'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { AdminSidebar, type AdminBadgeCounts } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'
import { RouteProgress } from './shell/RouteProgress'
import { OfflineBanner } from './shell/OfflineBanner'
import { BackToTop } from './shell/BackToTop'
import { SectionTabs } from './shell/SectionTabs'
import { UnsavedChangesHost } from './shell/UnsavedChanges'

export function AdminShell({
  email,
  name,
  badges,
  children,
}: {
  email: string
  name: string
  badges: AdminBadgeCounts
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('bodo-admin-sidebar') === 'collapsed')
    } catch {
      // Storage is blocked in some private windows; the sidebar stays expanded.
      setCollapsed(false)
    }
  }, [])
  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(
          'bodo-admin-sidebar',
          next ? 'collapsed' : 'expanded'
        )
      } catch {
        // Storage is blocked in some private windows; the choice lasts for this visit only.
      }
      return next
    })
  }

  return (
    <div
      className={`admin-site h-screen bg-surface flex overflow-hidden ${collapsed ? 'is-folded' : ''}`}
    >
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <UnsavedChangesHost />
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        collapsed={collapsed}
        onToggleCollapsed={toggleSidebar}
        badges={badges}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          unreadNotificationCount={badges.notifications ?? 0}
          name={name}
          email={email}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main
          id="admin-main"
          className="admin-main flex-1 overflow-auto"
          tabIndex={-1}
        >
          <OfflineBanner />
          <div className="admin-main-inner">
            <SectionTabs />
            {children}
          </div>
          <BackToTop />
        </main>
      </div>
    </div>
  )
}
