'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { NotificationIcon, timeAgo, type FeedItem } from './notifications/feed'

const POLL_MS = 60_000

export function AdminNotifications({ initialUnread }: { initialUnread: number }) {
  const router = useRouter()
  const [unread, setUnread] = useState(initialUnread)
  const [items, setItems] = useState<FeedItem[] | null>(null)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { items: FeedItem[]; unread: number }
      setItems(body.items)
      setUnread(body.unread)
      setFailed(false)
    } catch (error) {
      console.error('[notifications] could not load', error)
      setFailed(true)
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') void load()
    }
    const id = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function mark(body: object) {
    const res = await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = (await res.json()) as { unread: number }
    setUnread(result.unread)
  }

  async function openItem(item: FeedItem) {
    setOpen(false)
    if (!item.readAt) {
      setItems((list) => list?.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)) ?? null)
      mark({ ids: [item.id], read: true }).catch((error) => console.error('[notifications] mark read failed', error))
    }
    if (item.href) router.push(item.href)
  }

  return (
    <div className="admin-bell" ref={root}>
      <button
        type="button"
        className="admin-icon-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) void load()
        }}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && <span className="admin-bell-count">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && (
        <div className="admin-bell-panel" role="region" aria-label="Recent notifications">
          <div className="admin-bell-heading">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => {
                  setItems((list) => list?.map((entry) => ({ ...entry, readAt: entry.readAt ?? new Date().toISOString() })) ?? null)
                  mark({ all: true }).catch((error) => console.error('[notifications] mark all failed', error))
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
          {failed ? (
            <p className="admin-bell-empty">Notifications could not load. Try again in a moment.</p>
          ) : items === null ? (
            <p className="admin-bell-empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="admin-bell-empty">Nothing new. Messages, subscribers and errors appear here.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => openItem(item)} data-unread={!item.readAt || undefined}>
                    <NotificationIcon type={item.type} />
                    <span>
                      <strong>{item.title}</strong>
                      {item.body && <small>{item.body}</small>}
                      <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/notifications" className="admin-bell-all" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
