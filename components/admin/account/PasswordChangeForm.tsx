'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function PasswordChangeForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (next !== confirm) {
      toast.error('New passwords do not match.')
      return
    }
    if (next.length < 12) {
      toast.error('Password must be at least 12 characters.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Password updated. Use it next time you sign in.')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-5">
      <div>
        <h2 className="font-serif text-lg text-fg">Change password</h2>
        <p className="text-sm text-fg-muted mt-1">Minimum 12 characters. The new hash is stored in the database.</p>
      </div>

      <div>
        <label htmlFor="pw-current" className="block text-xs text-fg-muted mb-1">Current password</label>
        <input
          id="pw-current"
          type="password"
          value={current}
          onChange={e => setCurrent(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />
      </div>
      <div>
        <label htmlFor="pw-next" className="block text-xs text-fg-muted mb-1">New password</label>
        <input
          id="pw-next"
          type="password"
          value={next}
          onChange={e => setNext(e.target.value)}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />
      </div>
      <div>
        <label htmlFor="pw-confirm" className="block text-xs text-fg-muted mb-1">Confirm new password</label>
        <input
          id="pw-confirm"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving || !current || !next || !confirm}
        className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </div>
  )
}
