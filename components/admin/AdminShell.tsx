'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'
import { AdminThemeApplier } from './AdminThemeApplier'
import type { ThemePreference } from '@/lib/auth'

export function AdminShell({
  email,
  themePreference,
  unreadMessageCount,
  children,
}: {
  email: string
  themePreference: ThemePreference
  unreadMessageCount: number
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="admin-site h-screen bg-surface flex overflow-hidden">
      <AdminThemeApplier preference={themePreference} />
      <AdminSidebar
        email={email}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          themePreference={themePreference}
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
