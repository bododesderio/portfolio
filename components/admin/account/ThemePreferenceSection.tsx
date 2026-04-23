'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { Sun, Moon, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ThemePreference } from '@/lib/auth'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: React.ElementType; desc: string }> = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always use the light theme.' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always use the dark theme.' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Match your OS preference.' },
]

export function ThemePreferenceSection({ initial }: { initial: ThemePreference }) {
  const [pref, setPref] = useState<ThemePreference>(initial)
  const [saving, setSaving] = useState(false)
  const { setTheme } = useTheme()
  const { update } = useSession()

  async function choose(next: ThemePreference) {
    if (next === pref) return
    setSaving(true)
    setPref(next)
    setTheme(next)
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePreference: next }),
      })
      if (!res.ok) throw new Error()
      await update()
      toast.success('Preference saved.')
    } catch {
      toast.error('Saved locally, but failed to sync.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6">
      <h2 className="font-serif text-lg text-fg mb-1">Theme</h2>
      <p className="text-sm text-fg-muted mb-5">
        This applies only to the admin panel. Public visitors always see the site in their OS preference.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map(opt => {
          const Icon = opt.icon
          const active = opt.value === pref
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              disabled={saving}
              aria-pressed={active}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active
                  ? 'border-brand bg-brand/5'
                  : 'border-hairline hover:border-brand/50 hover:bg-muted'
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${active ? 'text-brand' : 'text-fg-muted'}`} />
              <p className="text-sm font-medium text-fg">{opt.label}</p>
              <p className="text-xs text-fg-muted mt-0.5">{opt.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
