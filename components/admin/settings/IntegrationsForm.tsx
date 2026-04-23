'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

type ConfigEntry = { masked: string; source: 'db' | 'env'; hasValue: boolean }

const GROUPS = [
  { label: 'Cloudinary',    keys: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] },
  { label: 'Resend (Email)',keys: ['RESEND_API_KEY'] },
  { label: 'Auth',          keys: ['ADMIN_EMAIL', 'NEXTAUTH_SECRET'] },
]

export function IntegrationsForm({
  config,
  analyticsEnabled,
}: {
  config: Record<string, ConfigEntry>
  analyticsEnabled: boolean
}) {
  const [analytics, setAnalytics] = useState(analyticsEnabled)
  const [savingAnalytics, setSavingAnalytics] = useState(false)

  async function toggleAnalytics(next: boolean) {
    setSavingAnalytics(true)
    setAnalytics(next)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'admin.analytics_enabled', value: next ? 'true' : 'false' }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Analytics ${next ? 'enabled' : 'disabled'}.`)
    } catch {
      setAnalytics(!next)
      toast.error('Failed to save.')
    } finally {
      setSavingAnalytics(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics toggle */}
      <div className="rounded-2xl border border-hairline bg-card p-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg text-fg">First-party analytics</h2>
          <p className="text-sm text-fg-muted mt-1">Records anonymous page views for the dashboard chart. Admin paths are never tracked.</p>
        </div>
        <button
          type="button"
          onClick={() => toggleAnalytics(!analytics)}
          disabled={savingAnalytics}
          aria-checked={analytics}
          role="switch"
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
            analytics ? 'bg-emerald-500' : 'bg-muted'
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${analytics ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <p className="text-sm text-fg-muted bg-muted rounded-xl px-4 py-3">
        Values below override environment variables at runtime. A server restart may be required for some changes to fully apply.
      </p>

      {GROUPS.map(group => (
        <div key={group.label} className="rounded-2xl border border-hairline bg-card p-6">
          <h2 className="font-serif text-lg text-fg mb-5">{group.label}</h2>
          <div className="space-y-4">
            {group.keys.map(k => <ConfigField key={k} k={k} entry={config[k]} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfigField({ k, entry }: { k: string; entry?: ConfigEntry }) {
  const [val, setVal] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const isSecret = k.includes('SECRET') || k.includes('API_SECRET') || k.includes('PASSWORD')

  async function save() {
    if (!val) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: k, value: val }),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved. Restart the server to apply.')
      setVal('')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-fg-muted">{k}</label>
          <div className="flex items-center gap-2">
            {entry?.source === 'db' && <span className="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand rounded">DB override</span>}
            {entry?.source === 'env' && entry?.hasValue && <span className="text-[10px] px-1.5 py-0.5 bg-muted text-fg-muted rounded">from env</span>}
          </div>
        </div>
        <div className="relative">
          <input
            type={isSecret && !show ? 'password' : 'text'}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={entry?.hasValue ? entry.masked : 'Not set'}
            className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm pr-10"
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
              aria-label={show ? 'Hide' : 'Show'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving || !val}
        className="px-4 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-40 text-white text-sm rounded-lg whitespace-nowrap"
      >
        Update
      </button>
    </div>
  )
}
