'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

export function AdminNotifications({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/admin/messages"
      className="relative p-2 rounded-lg text-fg-muted hover:bg-muted hover:text-fg transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      title={unreadCount > 0 ? `${unreadCount} unread` : 'No unread messages'}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[9px] font-semibold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
