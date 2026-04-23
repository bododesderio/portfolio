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
    <div className="h-screen bg-surface flex overflow-hidden">
      <AdminThemeApplier preference={themePreference} />
      <AdminSidebar
        email={email}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          email={email}
          themePreference={themePreference}
          unreadMessageCount={unreadMessageCount}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
