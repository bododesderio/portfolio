'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { NotificationIcon, timeAgo, type FeedItem } from './feed'

export function NotificationList({ items }: { items: FeedItem[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function setRead(item: FeedItem, read: boolean) {
    setBusy(item.id)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [item.id], read }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.refresh()
    } catch (error) {
      console.error('[notifications] update failed', error)
      toast.error('Could not update the notification.')
    } finally {
      setBusy(null)
    }
  }

  if (items.length === 0)
    return <p className="admin-empty">No notifications here yet.</p>

  return (
    <ul className="admin-feed">
      {items.map((item) => (
        <li key={item.id} data-unread={!item.readAt || undefined}>
          <NotificationIcon type={item.type} />
          <div className="admin-feed-text">
            {item.href ? (
              <a
                href={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  if (!item.readAt) void setRead(item, true)
                  router.push(item.href!)
                }}
              >
                {item.title}
              </a>
            ) : (
              <strong>{item.title}</strong>
            )}
            {item.body && <p>{item.body}</p>}
            <time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString('en-GB')}>
              {timeAgo(item.createdAt)}
            </time>
          </div>
          <button
            type="button"
            className="admin-text-button"
            disabled={busy === item.id}
            onClick={() => setRead(item, !item.readAt)}
          >
            {item.readAt ? 'Mark unread' : 'Mark read'}
          </button>
        </li>
      ))}
    </ul>
  )
}
