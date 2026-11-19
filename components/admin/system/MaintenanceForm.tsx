'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ExternalLink } from 'lucide-react'
import { ConfirmDialog } from '@/components/admin/shell/ConfirmDialog'
import { useUnsavedChanges } from '@/components/admin/shell/UnsavedChanges'
import type { MaintenanceState } from '@/lib/domain/maintenance'

/** datetime-local works in the viewer's clock; the stored value is ISO UTC. */
function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export function MaintenanceForm({ initial }: { initial: MaintenanceState }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initial.enabled)
  const [message, setMessage] = useState(initial.message)
  const [returnAt, setReturnAt] = useState(toLocalInput(initial.returnAt))
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const dirty =
    enabled !== initial.enabled || message !== initial.message || returnAt !== toLocalInput(initial.returnAt)
  const guard = useUnsavedChanges(dirty)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          message,
          returnAt: returnAt ? new Date(returnAt).toISOString() : '',
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      guard.clear()
      toast.success(enabled ? 'Maintenance mode is on.' : 'Maintenance settings saved. The site is open.')
      router.refresh()
    } catch (error) {
      console.error('[maintenance] save failed', error)
      toast.error(error instanceof Error ? error.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="admin-panel admin-form-panel"
      onSubmit={(event) => {
        event.preventDefault()
        if (enabled && !initial.enabled) setConfirming(true)
        else void save()
      }}
    >
      <div className="admin-maintenance-status" data-on={initial.enabled || undefined}>
        <strong>{initial.enabled ? 'The site is in maintenance mode' : 'The site is open to visitors'}</strong>
        <span>
          {initial.enabled
            ? 'Visitors see the maintenance notice. Public pages return status 503.'
            : 'Every public page is available as normal.'}
        </span>
      </div>
      <label className="admin-switch-row">
        <input type="checkbox" role="switch" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        <span>
          <strong>Show the maintenance notice to visitors</strong>
          <small>The admin, sign-in and email links in newsletters keep working.</small>
        </span>
      </label>
      <label className="admin-field">
        <span>Message for visitors</span>
        <textarea
          rows={3}
          maxLength={500}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <small>{message.length} / 500</small>
      </label>
      <label className="admin-field">
        <span>Expected back (optional)</span>
        <input type="datetime-local" value={returnAt} onChange={(event) => setReturnAt(event.target.value)} />
        <small>Shown to visitors in Kampala time. Leave empty if you are not sure.</small>
      </label>
      <div className="admin-form-actions">
        <a href="/maintenance?preview=1" target="_blank" rel="noopener noreferrer" className="admin-secondary-button">
          Preview the notice
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <button type="submit" className="admin-primary-button" disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Turn on maintenance mode?"
        body="Visitors will see the maintenance notice instead of the site until you turn it off. Contact and newsletter forms will not be reachable."
        confirmLabel="Turn it on"
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          void save()
        }}
      />
    </form>
  )
}
