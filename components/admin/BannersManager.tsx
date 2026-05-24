'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, Copy, X, ChevronDown, ChevronUp,
  Eye, EyeOff, Megaphone, Cookie, MessageSquare, CornerDownRight, Layers,
} from 'lucide-react'

interface Banner {
  id: string
  name: string
  kind: string
  placement: string
  title: string | null
  body: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  ctaVariant: string
  dismissable: boolean
  requireConsent: boolean
  theme: string
  enabled: boolean
  priority: number
  startsAt: string | null
  endsAt: string | null
  pagesInclude: string[]
  pagesExclude: string[]
  devices: string[]
  showOnce: boolean
  cooldownHours: number
  delaySeconds: number
  scrollTrigger: number | null
  exitIntent: boolean
  newsletterHook: boolean
}

const EMPTY_FORM = {
  name: '',
  kind: 'topbar' as string,
  placement: 'bottom' as string,
  title: '',
  body: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  ctaVariant: 'primary' as string,
  dismissable: true,
  requireConsent: false,
  theme: 'auto' as string,
  enabled: false,
  priority: 0,
  startsAt: '',
  endsAt: '',
  pagesInclude: '' as string,
  pagesExclude: '' as string,
  devices: [] as string[],
  showOnce: false,
  cooldownHours: 0,
  delaySeconds: 0,
  scrollTrigger: '' as string | number,
  exitIntent: false,
  newsletterHook: false,
  animation: 'fade' as string,
}

type FormState = typeof EMPTY_FORM

const KIND_OPTIONS = [
  { value: 'topbar', label: 'Top Bar', icon: Megaphone },
  { value: 'bottombar', label: 'Bottom Bar', icon: Layers },
  { value: 'modal', label: 'Modal', icon: MessageSquare },
  { value: 'corner', label: 'Corner Popup', icon: CornerDownRight },
  { value: 'cookie', label: 'Cookie Consent', icon: Cookie },
]

const KIND_COLORS: Record<string, string> = {
  topbar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  bottombar: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  modal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  corner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cookie: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const PLACEMENT_OPTIONS = ['top', 'bottom', 'left', 'right', 'center']
const THEME_OPTIONS = ['auto', 'light', 'dark', 'brand']
const CTA_VARIANTS = ['primary', 'outline', 'invert']
const DEVICE_OPTIONS = ['mobile', 'tablet', 'desktop']
const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'Fade In' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'pop', label: 'Pop / Scale' },
  { value: 'drop', label: 'Drop In' },
  { value: 'none', label: 'None' },
]

const ANIMATION_STYLES: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
  fade:          { from: { opacity: 0 },                                                       to: { opacity: 1 } },
  'slide-up':    { from: { opacity: 0, transform: 'translateY(24px)' },                        to: { opacity: 1, transform: 'translateY(0)' } },
  'slide-down':  { from: { opacity: 0, transform: 'translateY(-24px)' },                       to: { opacity: 1, transform: 'translateY(0)' } },
  'slide-left':  { from: { opacity: 0, transform: 'translateX(24px)' },                        to: { opacity: 1, transform: 'translateX(0)' } },
  'slide-right': { from: { opacity: 0, transform: 'translateX(-24px)' },                       to: { opacity: 1, transform: 'translateX(0)' } },
  pop:           { from: { opacity: 0, transform: 'scale(0.85)' },                             to: { opacity: 1, transform: 'scale(1)' } },
  drop:          { from: { opacity: 0, transform: 'translateY(-40px) scale(0.95)' },            to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
  none:          { from: { opacity: 1 },                                                       to: { opacity: 1 } },
}

function bannerToForm(b: Banner): FormState {
  return {
    name: b.name,
    kind: b.kind,
    placement: b.placement,
    title: b.title ?? '',
    body: b.body ?? '',
    imageUrl: b.imageUrl ?? '',
    ctaLabel: b.ctaLabel ?? '',
    ctaUrl: b.ctaUrl ?? '',
    ctaVariant: b.ctaVariant,
    dismissable: b.dismissable,
    requireConsent: b.requireConsent,
    theme: b.theme,
    enabled: b.enabled,
    priority: b.priority,
    startsAt: b.startsAt ? b.startsAt.slice(0, 16) : '',
    endsAt: b.endsAt ? b.endsAt.slice(0, 16) : '',
    pagesInclude: b.pagesInclude.join(', '),
    pagesExclude: b.pagesExclude.join(', '),
    devices: b.devices,
    showOnce: b.showOnce,
    cooldownHours: b.cooldownHours,
    delaySeconds: b.delaySeconds,
    scrollTrigger: b.scrollTrigger ?? '',
    exitIntent: b.exitIntent,
    newsletterHook: b.newsletterHook,
    animation: 'fade',
  }
}

function formToPayload(f: FormState) {
  return {
    name: f.name,
    kind: f.kind,
    placement: f.placement,
    title: f.title || null,
    body: f.body || null,
    imageUrl: f.imageUrl || null,
    ctaLabel: f.ctaLabel || null,
    ctaUrl: f.ctaUrl || null,
    ctaVariant: f.ctaVariant,
    dismissable: f.dismissable,
    requireConsent: f.requireConsent,
    theme: f.theme,
    enabled: f.enabled,
    priority: f.priority,
    startsAt: f.startsAt || null,
    endsAt: f.endsAt || null,
    pagesInclude: typeof f.pagesInclude === 'string'
      ? f.pagesInclude.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    pagesExclude: typeof f.pagesExclude === 'string'
      ? f.pagesExclude.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    devices: f.devices,
    showOnce: f.showOnce,
    cooldownHours: f.cooldownHours,
    delaySeconds: f.delaySeconds,
    scrollTrigger: f.scrollTrigger === '' ? null : Number(f.scrollTrigger),
    exitIntent: f.exitIntent,
    newsletterHook: f.newsletterHook,
  }
}

export function BannersManager({ initial }: { initial: Banner[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Banner[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function startCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setCreating(true)
  }

  function startEdit(b: Banner) {
    setCreating(false)
    setEditing(b.id)
    setForm(bannerToForm(b))
  }

  function cancel() {
    setEditing(null)
    setCreating(false)
    setForm(EMPTY_FORM)
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required.'); return }
    setSaving(true)
    try {
      const payload = formToPayload(form)
      const url = editing ? `/api/admin/banners/${editing}` : '/api/admin/banners'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed.')

      if (editing) {
        setItems(prev => prev.map(i => i.id === editing ? data : i))
      } else {
        setItems(prev => [data, ...prev])
      }
      cancel()
      toast.success(editing ? 'Banner updated.' : 'Banner created.')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !b.enabled }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === b.id ? updated : i))
      toast.success(updated.enabled ? 'Banner enabled.' : 'Banner disabled.')
    }
  }

  async function duplicate(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}/duplicate`, { method: 'POST' })
    if (res.ok) {
      const clone = await res.json()
      setItems(prev => [clone, ...prev])
      toast.success('Banner duplicated.')
    }
  }

  async function remove(b: Banner) {
    if (!confirm(`Delete "${b.name}"?`)) return
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== b.id))
      toast.success('Banner deleted.')
      if (editing === b.id) cancel()
    }
  }

  function toggleDevice(device: string) {
    setForm(f => ({
      ...f,
      devices: f.devices.includes(device)
        ? f.devices.filter(d => d !== device)
        : [...f.devices, device],
    }))
  }

  const showForm = creating || editing

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{items.length} banner{items.length !== 1 ? 's' : ''}</p>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-hairline bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-fg">{editing ? 'Edit banner' : 'New banner'}</h3>
            <button onClick={cancel} className="p-1.5 rounded-lg text-fg-muted hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>

          {/* Row 1: Name + Kind */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Name (internal)</label>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="e.g. Holiday Sale Banner"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Kind</label>
              <select
                value={form.kind}
                onChange={e => update('kind', e.target.value)}
                className="w-full px-3 py-2 select-styled bg-muted border border-hairline rounded-lg text-sm text-fg"
              >
                {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Title + Placement + Theme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Title (optional)</label>
              <input
                value={form.title}
                onChange={e => update('title', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Placement</label>
              <select
                value={form.placement}
                onChange={e => update('placement', e.target.value)}
                className="w-full px-3 py-2 select-styled bg-muted border border-hairline rounded-lg text-sm text-fg"
              >
                {PLACEMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Theme</label>
              <select
                value={form.theme}
                onChange={e => update('theme', e.target.value)}
                className="w-full px-3 py-2 select-styled bg-muted border border-hairline rounded-lg text-sm text-fg"
              >
                {THEME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Body text</label>
            <textarea
              rows={3}
              value={form.body}
              onChange={e => update('body', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg resize-none focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="Banner message shown to visitors..."
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">CTA label</label>
              <input
                value={form.ctaLabel}
                onChange={e => update('ctaLabel', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="e.g. Learn more"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">CTA URL</label>
              <input
                value={form.ctaUrl}
                onChange={e => update('ctaUrl', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="/contact"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">CTA variant</label>
              <select
                value={form.ctaVariant}
                onChange={e => update('ctaVariant', e.target.value)}
                className="w-full px-3 py-2 select-styled bg-muted border border-hairline rounded-lg text-sm text-fg"
              >
                {CTA_VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              { key: 'enabled' as const, label: 'Enabled' },
              { key: 'dismissable' as const, label: 'Dismissable' },
              { key: 'requireConsent' as const, label: 'Require consent' },
              { key: 'showOnce' as const, label: 'Show once' },
              { key: 'exitIntent' as const, label: 'Exit intent' },
              { key: 'newsletterHook' as const, label: 'Newsletter hook' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-fg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={e => update(key, e.target.checked)}
                  className="rounded border-hairline text-brand focus:ring-brand"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Scheduling + targeting */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Starts at</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => update('startsAt', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Ends at</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={e => update('endsAt', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={e => update('priority', Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Delay (seconds)</label>
              <input
                type="number"
                min={0}
                value={form.delaySeconds}
                onChange={e => update('delaySeconds', Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Devices */}
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Devices (empty = all)</label>
            <div className="flex gap-3">
              {DEVICE_OPTIONS.map(d => (
                <label key={d} className="flex items-center gap-1.5 text-sm text-fg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.devices.includes(d)}
                    onChange={() => toggleDevice(d)}
                    className="rounded border-hairline text-brand focus:ring-brand"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>

          {/* Page targeting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Pages include (comma-separated paths)</label>
              <input
                value={form.pagesInclude}
                onChange={e => update('pagesInclude', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="/, /blog"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Pages exclude (comma-separated paths)</label>
              <input
                value={form.pagesExclude}
                onChange={e => update('pagesExclude', e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="/admin, /api"
              />
            </div>
          </div>

          {/* Animation + Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-fg-muted mb-1.5">Entrance animation</label>
                <select
                  value={form.animation}
                  onChange={e => update('animation', e.target.value)}
                  className="w-full px-3 py-2 select-styled bg-muted border border-hairline rounded-lg text-sm text-fg"
                >
                  {ANIMATION_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="flex-shrink-0 pt-5">
                <PreviewTrigger form={form} />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={cancel} className="px-4 py-2 text-sm text-fg-muted hover:text-fg rounded-lg border border-hairline hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : editing ? 'Update banner' : 'Create banner'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-fg-muted">
          <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No banners yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(b => {
            const isExpanded = expanded === b.id
            return (
              <div key={b.id} className="rounded-xl border border-hairline bg-card overflow-hidden">
                {/* Summary row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleEnabled(b)}
                    title={b.enabled ? 'Disable' : 'Enable'}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      b.enabled ? 'text-green-500 hover:bg-green-500/10' : 'text-fg-muted hover:bg-muted'
                    }`}
                  >
                    {b.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : b.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${KIND_COLORS[b.kind] || 'bg-muted text-fg-muted'}`}>
                      {b.kind}
                    </span>
                    <span className="text-sm font-medium text-fg truncate">{b.name}</span>
                    {b.title && <span className="hidden sm:inline text-xs text-fg-muted truncate">&mdash; {b.title}</span>}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-fg-muted ml-auto flex-shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-fg-muted ml-auto flex-shrink-0" />}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-brand hover:bg-brand/10 transition-colors" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => duplicate(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-blue-500 hover:bg-blue-500/10 transition-colors" title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-hairline px-4 py-3 bg-muted/30">
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                      <div><dt className="text-fg-muted">Placement</dt><dd className="text-fg font-medium">{b.placement}</dd></div>
                      <div><dt className="text-fg-muted">Theme</dt><dd className="text-fg font-medium">{b.theme}</dd></div>
                      <div><dt className="text-fg-muted">Priority</dt><dd className="text-fg font-medium">{b.priority}</dd></div>
                      <div><dt className="text-fg-muted">Dismissable</dt><dd className="text-fg font-medium">{b.dismissable ? 'Yes' : 'No'}</dd></div>
                      {b.body && <div className="col-span-2 md:col-span-4"><dt className="text-fg-muted">Body</dt><dd className="text-fg mt-0.5">{b.body}</dd></div>}
                      {b.ctaLabel && <div><dt className="text-fg-muted">CTA</dt><dd className="text-fg font-medium">{b.ctaLabel}</dd></div>}
                      {b.startsAt && <div><dt className="text-fg-muted">Starts</dt><dd className="text-fg font-medium">{new Date(b.startsAt).toLocaleDateString()}</dd></div>}
                      {b.endsAt && <div><dt className="text-fg-muted">Ends</dt><dd className="text-fg font-medium">{new Date(b.endsAt).toLocaleDateString()}</dd></div>}
                      {b.devices.length > 0 && <div><dt className="text-fg-muted">Devices</dt><dd className="text-fg font-medium">{b.devices.join(', ')}</dd></div>}
                    </dl>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Preview Trigger + Live Preview Modal ────────────────────────────────── */

function PreviewTrigger({ form }: { form: FormState }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/10 transition-colors"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>
      {open && <BannerPreviewModal form={form} onClose={() => setOpen(false)} />}
    </>
  )
}

function BannerPreviewModal({ form, onClose }: { form: FormState; onClose: () => void }) {
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(false)
  const anim = ANIMATION_STYLES[form.animation] || ANIMATION_STYLES.fade

  const replay = useCallback(() => {
    setVisible(false)
    setAnimating(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true)
        setVisible(true)
      })
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setAnimating(true); setVisible(true) }, 150)
    return () => clearTimeout(t)
  }, [])

  // Theme class for the preview
  const themeBg = form.theme === 'dark' ? 'bg-ink-900 text-white'
    : form.theme === 'brand' ? 'bg-brand text-white'
    : 'bg-white text-ink-900 dark:bg-ink-800 dark:text-white'

  const ctaBg = form.ctaVariant === 'primary' ? 'bg-brand text-white hover:bg-brand-600'
    : form.ctaVariant === 'invert' ? 'bg-white text-ink-900 hover:bg-ink-50'
    : 'border border-current bg-transparent hover:bg-white/10'

  // Position styles based on kind
  const isBar = form.kind === 'topbar' || form.kind === 'bottombar'
  const isCorner = form.kind === 'corner'

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-hairline shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div>
            <h3 className="font-serif text-lg text-fg">Banner Preview</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Animation: <span className="font-medium text-brand">{ANIMATION_OPTIONS.find(a => a.value === form.animation)?.label || form.animation}</span>
              {' '}&middot; Kind: <span className="font-medium">{form.kind}</span>
              {' '}&middot; Theme: <span className="font-medium">{form.theme}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={replay}
              className="px-3 py-1.5 text-xs font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/10 transition-colors"
            >
              Replay
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-fg-muted hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview area — simulates a page */}
        <div className="relative flex-1 min-h-[400px] bg-surface overflow-hidden">
          {/* Simulated page content */}
          <div className="p-8 space-y-4 opacity-30">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
            <div className="h-32 w-full bg-muted rounded-xl" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>

          {/* The actual banner preview */}
          <div
            className={`absolute ${
              isBar && form.placement === 'top' ? 'top-0 left-0 right-0' :
              isBar ? 'bottom-0 left-0 right-0' :
              isCorner && form.placement === 'right' ? 'bottom-4 right-4' :
              isCorner ? 'bottom-4 left-4' :
              'inset-0 flex items-center justify-center p-6'
            }`}
            style={{
              ...(animating ? anim.to : anim.from),
              transition: form.animation === 'none' ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: visible ? 'auto' : 'none',
            }}
          >
            <div className={`${
              isBar
                ? `w-full px-4 py-3 flex items-center justify-between gap-4 shadow-lg ${themeBg}`
                : isCorner
                ? `w-80 rounded-xl p-5 shadow-2xl border border-hairline ${themeBg}`
                : `w-full max-w-md rounded-2xl p-6 shadow-2xl border border-hairline ${themeBg}`
            }`}>
              {form.dismissable && (
                <button className="absolute top-2 right-2 p-1 rounded opacity-60 hover:opacity-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {form.title && (
                <p className={`font-semibold ${isBar ? 'text-sm' : 'text-base mb-1'}`}>
                  {form.title}
                </p>
              )}
              {form.body && (
                <p className={`opacity-80 ${isBar ? 'text-xs flex-1' : 'text-sm mb-3'}`}>
                  {form.body}
                </p>
              )}
              {form.ctaLabel && (
                <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${ctaBg} ${isBar ? 'flex-shrink-0' : ''}`}>
                  {form.ctaLabel}
                </button>
              )}
              {!form.title && !form.body && !form.ctaLabel && (
                <p className="text-sm opacity-50 italic">Add title, body, or CTA to see preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Animation thumbnails */}
        <div className="border-t border-hairline px-5 py-3">
          <p className="text-[10px] uppercase tracking-widest text-fg-muted mb-2">Quick switch animation</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ANIMATION_OPTIONS.map(a => (
              <button
                key={a.value}
                onClick={() => {
                  // We can't update parent form from here, but we replay with visual feedback
                  setVisible(false)
                  setAnimating(false)
                  setTimeout(() => { setAnimating(true); setVisible(true) }, 100)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  form.animation === a.value
                    ? 'bg-brand text-white'
                    : 'bg-muted text-fg-muted hover:text-fg'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
