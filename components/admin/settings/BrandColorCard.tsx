'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const PRESETS = [
  { label: 'Kampala Gold',    value: '#C9A84C' },
  { label: 'Linear Indigo',   value: '#5E6AD2' },
  { label: 'Vercel Black',    value: '#171717' },
  { label: 'Stripe Blue',     value: '#635BFF' },
  { label: 'Supabase Green',  value: '#3ECF8E' },
  { label: 'Copper',          value: '#B87333' },
  { label: 'Burgundy',        value: '#8B1E3F' },
  { label: 'Forest',          value: '#2D5F3F' },
]

export function BrandColorCard({ initialBrand }: { initialBrand: string }) {
  const [color, setColor] = useState(initialBrand)
  const [saving, setSaving] = useState(false)

  async function save() {
    const normalized = color.startsWith('#') ? color : `#${color}`
    if (!/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(normalized)) {
      toast.error('Invalid hex color.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'theme.brand_color', value: normalized }),
      })
      if (!res.ok) throw new Error()
      document.documentElement.style.setProperty('--brand', hexToRgb(normalized))
      toast.success('Brand colour updated — reload to propagate full palette.')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-5">
      <div>
        <h2 className="font-serif text-lg text-fg">Brand colour</h2>
        <p className="text-sm text-fg-muted mt-1">Drives every <code className="text-[11px] font-mono bg-muted px-1 rounded">bg-brand</code> and derived shades 50–900.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-xl border border-hairline shadow-inner" style={{ backgroundColor: color }} aria-label="Preview" />
        <input
          type="color"
          value={color.startsWith('#') ? color : `#${color}`}
          onChange={e => setColor(e.target.value)}
          className="h-11 w-14 rounded-lg cursor-pointer bg-transparent border border-hairline"
          aria-label="Color picker"
        />
        <input
          type="text"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg font-mono text-sm uppercase w-40 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
        >
          {saving ? 'Saving…' : 'Apply'}
        </button>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-fg-muted mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setColor(p.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                color.toLowerCase() === p.value.toLowerCase()
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-hairline text-fg-muted hover:border-brand/40'
              }`}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.value }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}
