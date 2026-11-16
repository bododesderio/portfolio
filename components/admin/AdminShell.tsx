'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

export function AdminShell({
  email,
  unreadMessageCount,
  children,
}: {
  email: string
  unreadMessageCount: number
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('bodo-admin-sidebar') === 'collapsed')
    } catch {}
  }, [])
  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(
          'bodo-admin-sidebar',
          next ? 'collapsed' : 'expanded'
        )
      } catch {}
      return next
    })
  }

  return (
    <div
      className={`admin-site h-screen bg-surface flex overflow-hidden ${collapsed ? 'is-folded' : ''}`}
    >
      <AdminSidebar
        email={email}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        collapsed={collapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          unreadMessageCount={unreadMessageCount}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main
          id="admin-main"
          className="admin-main flex-1 overflow-auto"
          tabIndex={-1}
        >
          <div className="admin-main-inner">{children}</div>
        </main>
      </div>
    </div>
  )
}
