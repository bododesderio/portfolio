'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function AvailabilityCard({ initial }: { initial: { status: string; label: string; note: string } }) {
  const [status, setStatus] = useState(initial.status)
  const [label, setLabel] = useState(initial.label)
  const [note, setNote] = useState(initial.note)
  const [saving, setSaving] = useState(false)

  async function patchContent(fieldKey: string, value: string) {
    const res = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'home', section: 'availability', field_key: fieldKey, value, field_type: 'text' }),
    })
    if (!res.ok) throw new Error()
  }

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        patchContent('status', status),
        patchContent('label', label),
        patchContent('note', note),
      ])
      toast.success('Availability updated.')
    } catch {
      toast.error('Failed to update availability.')
    } finally {
      setSaving(false)
    }
  }

  const available = status === 'available'

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-5">
      <div>
        <h2 className="font-serif text-lg text-fg">Availability</h2>
        <p className="text-sm text-fg-muted mt-1">Badge on the home page. Toggle when you open or close to new work.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStatus(available ? 'unavailable' : 'available')}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            available ? 'bg-emerald-500' : 'bg-muted'
          }`}
          role="switch"
          aria-checked={available}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${available ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-fg">
          {available ? 'Currently open to new work' : 'Currently closed'}
        </span>
      </div>

      <div>
        <label htmlFor="av-label" className="block text-xs text-fg-muted mb-1">Badge label</label>
        <input
          id="av-label"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />
      </div>
      <div>
        <label htmlFor="av-note" className="block text-xs text-fg-muted mb-1">Supporting note</label>
        <textarea
          id="av-note"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm resize-none"
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
      >
        {saving ? 'Saving…' : 'Save availability'}
      </button>
    </div>
  )
}
