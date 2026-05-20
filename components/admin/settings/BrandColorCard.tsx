'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Palette, Sparkles } from 'lucide-react'

/* ─── Preset colors ───────────────────────────────────────────────────────── */

const PRESETS = [
  { label: 'Kampala Gold',   value: '#C9A84C' },
  { label: 'Linear Indigo',  value: '#5E6AD2' },
  { label: 'Vercel Black',   value: '#171717' },
  { label: 'Stripe Blue',    value: '#635BFF' },
  { label: 'Supabase Green', value: '#3ECF8E' },
  { label: 'Copper',         value: '#B87333' },
  { label: 'Burgundy',       value: '#8B1E3F' },
  { label: 'Forest',         value: '#2D5F3F' },
  { label: 'Ocean',          value: '#0077B6' },
  { label: 'Coral',          value: '#E8614D' },
]

/* ─── Theme templates ─────────────────────────────────────────────────────── */

interface ThemeTemplate {
  name: string
  brand: string
  description: string
  preview: { bg: string; card: string; text: string; accent: string }
}

const TEMPLATES: ThemeTemplate[] = [
  {
    name: 'Warm Luxury',
    brand: '#C9A84C',
    description: 'Gold tones with warm neutrals — elegant and premium.',
    preview: { bg: '#FAFAF7', card: '#FFFFFF', text: '#0A0A0B', accent: '#C9A84C' },
  },
  {
    name: 'Minimal Tech',
    brand: '#5E6AD2',
    description: 'Cool indigo with clean whites — modern SaaS aesthetic.',
    preview: { bg: '#FAFAFA', card: '#FFFFFF', text: '#111111', accent: '#5E6AD2' },
  },
  {
    name: 'Bold Creative',
    brand: '#E8614D',
    description: 'Vibrant coral with energy — stands out and commands attention.',
    preview: { bg: '#FFF8F6', card: '#FFFFFF', text: '#1A1A1A', accent: '#E8614D' },
  },
  {
    name: 'Nature Trust',
    brand: '#2D5F3F',
    description: 'Deep forest green — grounded, trustworthy, sustainable.',
    preview: { bg: '#F7FAF8', card: '#FFFFFF', text: '#0D1B12', accent: '#2D5F3F' },
  },
]

/* ─── Color math ──────────────────────────────────────────────────────────── */

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  let r = parseInt(full.slice(0, 2), 16) / 255
  let g = parseInt(full.slice(2, 4), 16) / 255
  let b = parseInt(full.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToRgbStr(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60)       { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else              { r = c; b = x }
  return `${Math.round((r + m) * 255)} ${Math.round((g + m) * 255)} ${Math.round((b + m) * 255)}`
}

function shiftLightness(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToRgbStr(h, s, Math.max(0, Math.min(1, l + delta)))
}

/** Apply the full brand palette to :root CSS vars — instant client-side preview */
function applyPaletteToDOM(hex: string) {
  const root = document.documentElement.style
  root.setProperty('--brand', hexToRgb(hex))
  root.setProperty('--brand-light', shiftLightness(hex, 0.12))
  root.setProperty('--brand-dark', shiftLightness(hex, -0.14))
  const deltas: Record<string, number> = {
    50: 0.38, 100: 0.30, 200: 0.19, 300: 0.08, 400: 0.03,
    500: 0.00, 600: -0.08, 700: -0.19, 800: -0.30, 900: -0.40,
  }
  for (const [shade, delta] of Object.entries(deltas)) {
    root.setProperty(`--brand-${shade}`, shiftLightness(hex, delta))
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function BrandColorCard({ initialBrand }: { initialBrand: string }) {
  const [color, setColor] = useState(initialBrand)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'presets' | 'templates' | 'custom'>('presets')

  function selectColor(hex: string) {
    setColor(hex)
    applyPaletteToDOM(hex) // Instant preview
  }

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
      applyPaletteToDOM(normalized)
      toast.success('Brand colour saved and applied globally!')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  // Generate palette preview swatches
  const paletteShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  const paletteDeltas: Record<number, number> = {
    50: 0.38, 100: 0.30, 200: 0.19, 300: 0.08, 400: 0.03,
    500: 0.00, 600: -0.08, 700: -0.19, 800: -0.30, 900: -0.40,
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-lg text-fg">Brand colour</h2>
          <p className="text-sm text-fg-muted mt-1">
            Drives every <code className="text-[11px] font-mono bg-muted px-1 rounded">bg-brand</code> element across the site.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-full transition-colors inline-flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save & Apply'}
        </button>
      </div>

      {/* Current color preview + picker */}
      <div className="flex items-center gap-4">
        <div
          className="h-20 w-20 rounded-2xl border-2 border-hairline shadow-inner flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="text-white text-xs font-mono drop-shadow-sm">{color}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color.startsWith('#') ? color : `#${color}`}
              onChange={e => selectColor(e.target.value)}
              className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border border-hairline"
              aria-label="Visual color picker"
            />
            <input
              type="text"
              value={color}
              onChange={e => {
                setColor(e.target.value)
                if (/^#[a-fA-F0-9]{6}$/.test(e.target.value)) applyPaletteToDOM(e.target.value)
              }}
              placeholder="#C9A84C"
              className="px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg font-mono text-sm uppercase w-32 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <p className="text-[11px] text-fg-muted">Pick visually or type a hex code</p>
        </div>
        {/* Live palette strip */}
        <div className="hidden md:flex flex-1 h-10 rounded-lg overflow-hidden border border-hairline">
          {paletteShades.map(shade => {
            const rgb = shade === 500 ? hexToRgb(color) : shiftLightness(color, paletteDeltas[shade])
            return (
              <div
                key={shade}
                className="flex-1 relative group"
                style={{ backgroundColor: `rgb(${rgb})` }}
                title={`${shade}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-white drop-shadow-sm">
                  {shade}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hairline">
        {[
          { key: 'presets' as const, label: 'Presets', icon: Palette },
          { key: 'templates' as const, label: 'Theme Templates', icon: Sparkles },
          { key: 'custom' as const, label: 'Custom', icon: Palette },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-brand text-brand'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'presets' && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => selectColor(p.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                color.toLowerCase() === p.value.toLowerCase()
                  ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/20'
                  : 'border-hairline text-fg-muted hover:border-brand/40 hover:bg-muted'
              }`}
            >
              <span className="h-4 w-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: p.value }} />
              {p.label}
              {color.toLowerCase() === p.value.toLowerCase() && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map(t => {
            const isActive = color.toLowerCase() === t.brand.toLowerCase()
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => selectColor(t.brand)}
                className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                  isActive ? 'border-brand ring-2 ring-brand/20' : 'border-hairline hover:border-brand/30'
                }`}
              >
                {/* Mini preview */}
                <div className="h-24 relative" style={{ backgroundColor: t.preview.bg }}>
                  {/* Simulated nav bar */}
                  <div className="absolute top-0 inset-x-0 h-6 flex items-center px-3 gap-2" style={{ backgroundColor: t.preview.card, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                    <div className="h-1.5 w-10 rounded bg-current opacity-20" style={{ color: t.preview.text }} />
                    <div className="h-1.5 w-8 rounded bg-current opacity-10 ml-auto" style={{ color: t.preview.text }} />
                    <div className="h-1.5 w-8 rounded bg-current opacity-10" style={{ color: t.preview.text }} />
                  </div>
                  {/* Simulated content */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-20 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.7 }} />
                      <div className="h-1.5 w-32 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.2 }} />
                    </div>
                    <div className="h-5 px-2.5 rounded-full text-[8px] font-medium flex items-center text-white" style={{ backgroundColor: t.preview.accent }}>
                      CTA
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 bg-card">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: t.brand, borderColor: 'rgba(0,0,0,0.1)' }} />
                    <span className="text-sm font-medium text-fg">{t.name}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-brand ml-auto" />}
                  </div>
                  <p className="text-[11px] text-fg-muted mt-1">{t.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <p className="text-sm text-fg-muted">Use the color picker above or enter any hex code. The full palette (50–900 shades) is derived automatically.</p>
          {/* Full palette preview */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-fg-muted mb-2">Generated Palette</p>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
              {paletteShades.map(shade => {
                const rgb = shade === 500 ? hexToRgb(color) : shiftLightness(color, paletteDeltas[shade])
                return (
                  <div key={shade} className="text-center">
                    <div
                      className="h-12 rounded-lg border border-hairline mb-1"
                      style={{ backgroundColor: `rgb(${rgb})` }}
                    />
                    <span className="text-[10px] font-mono text-fg-muted">{shade}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
