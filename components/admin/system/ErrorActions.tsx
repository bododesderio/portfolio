'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/admin/shell/ConfirmDialog'

const ACTIONS: Record<string, Array<{ status: string; label: string }>> = {
  open: [
    { status: 'resolved', label: 'Mark resolved' },
    { status: 'ignored', label: 'Ignore' },
  ],
  resolved: [{ status: 'open', label: 'Reopen' }],
  ignored: [{ status: 'open', label: 'Stop ignoring' }],
}

export function ErrorActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function update(next: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], status: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.refresh()
    } catch (error) {
      console.error('[errors] status update failed', error)
      toast.error('Could not update this error.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="admin-form-actions">
      {(ACTIONS[status] ?? []).map((action) => (
        <button
          key={action.status}
          type="button"
          className={action.status === 'resolved' ? 'admin-primary-button' : 'admin-secondary-button'}
          disabled={busy}
          onClick={() => update(action.status)}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

export function ClearResolvedButton({ count }: { count: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  return (
    <>
      <button type="button" className="admin-secondary-button" onClick={() => setConfirming(true)}>
        Delete resolved
      </button>
      <ConfirmDialog
        open={confirming}
        title={`Delete ${count} resolved error${count === 1 ? '' : 's'}?`}
        body="Resolved reports are removed. If one of these errors happens again it is recorded as new."
        confirmLabel="Delete resolved"
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false)
          try {
            const res = await fetch('/api/admin/errors', { method: 'DELETE' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            toast.success('Resolved errors deleted.')
            router.refresh()
          } catch (error) {
            console.error('[errors] delete resolved failed', error)
            toast.error('Could not delete resolved errors.')
          }
        }}
      />
    </>
  )
}
