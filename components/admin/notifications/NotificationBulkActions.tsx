'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/admin/shell/ConfirmDialog'

export function NotificationBulkActions({ unread }: { unread: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function send(method: 'PATCH' | 'DELETE', done: string) {
    try {
      const res = await fetch('/api/admin/notifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'PATCH' ? JSON.stringify({ all: true }) : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success(done)
      router.refresh()
    } catch (error) {
      console.error('[notifications] bulk action failed', error)
      toast.error('That did not work. Try again.')
    }
  }

  return (
    <>
      {unread > 0 && (
        <button type="button" className="admin-secondary-button" onClick={() => send('PATCH', 'All notifications marked as read.')}>
          Mark all as read
        </button>
      )}
      <button type="button" className="admin-secondary-button" onClick={() => setConfirming(true)}>
        Clear read
      </button>
      <ConfirmDialog
        open={confirming}
        title="Clear read notifications?"
        body="Notifications you have already read are deleted. Unread ones stay."
        confirmLabel="Clear read"
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          void send('DELETE', 'Read notifications cleared.')
        }}
      />
    </>
  )
}
