'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const GROUPS: Array<{ label: string; keys: Array<{ key: string; label: string; placeholder?: string }> }> = [
  {
    label: 'Identity',
    keys: [
      { key: 'site.name',         label: 'Site name' },
      { key: 'site.tagline',      label: 'Tagline' },
      { key: 'site.email',        label: 'Public email' },
      { key: 'site.location',     label: 'Location' },
      { key: 'site.calendly_url', label: 'Calendly URL', placeholder: 'https://calendly.com/…' },
    ],
  },
  {
    label: 'Social',
    keys: [
      { key: 'social.linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/…' },
      { key: 'social.github',    label: 'GitHub',    placeholder: 'https://github.com/…' },
      { key: 'social.twitter',   label: 'Twitter / X' },
      { key: 'social.instagram', label: 'Instagram' },
      { key: 'social.facebook',  label: 'Facebook' },
      { key: 'social.medium',    label: 'Medium', placeholder: 'https://medium.com/@…' },
    ],
  },
]

export function SiteSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [values, setValues] = useState(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)

  async function save(key: string) {
    setSaving(key)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] ?? '' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved.')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {GROUPS.map(group => (
        <div key={group.label} className="rounded-2xl border border-hairline bg-card p-6">
          <h2 className="font-serif text-lg text-fg mb-5">{group.label}</h2>
          <div className="space-y-4">
            {group.keys.map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <label htmlFor={`setting-${key}`} className="block text-xs text-fg-muted mb-1">{label}</label>
                  <input
                    id={`setting-${key}`}
                    value={values[key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => save(key)}
                  disabled={saving === key}
                  className="px-4 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  {saving === key ? 'Saving…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
