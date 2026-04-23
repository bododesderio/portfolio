'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ThemePreference } from '@/lib/auth'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: React.ElementType }> = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function AdminThemeSelector({ initial }: { initial: ThemePreference }) {
  const [pref, setPref] = useState<ThemePreference>(initial)
  const [open, setOpen] = useState(false)
  const { setTheme } = useTheme()
  const { update } = useSession()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  async function choose(next: ThemePreference) {
    setPref(next)
    setTheme(next)
    setOpen(false)
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePreference: next }),
      })
      if (!res.ok) throw new Error()
      await update() // triggers jwt() callback to refetch themePreference
    } catch {
      toast.error('Saved locally, but failed to sync preference.')
    }
  }

  const Active = OPTIONS.find(o => o.value === pref)?.icon ?? Monitor

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-lg text-fg-muted hover:bg-muted hover:text-fg transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${pref}`}
        title={`Theme: ${pref}`}
      >
        <Active className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-hairline bg-card shadow-xl py-1.5 z-50"
        >
          {OPTIONS.map(opt => {
            const Icon = opt.icon
            const active = opt.value === pref
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 text-fg-muted" />
                <span className="flex-1 text-left">{opt.label}</span>
                {active && <Check className="h-3.5 w-3.5 text-brand" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
