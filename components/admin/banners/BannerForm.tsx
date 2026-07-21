'use client'

import { X } from 'lucide-react'
import { PreviewTrigger } from './BannerPreviewModal'
import {
  FormState,
  KIND_OPTIONS, PLACEMENT_OPTIONS, THEME_OPTIONS, CTA_VARIANTS,
  DEVICE_OPTIONS, ANIMATION_OPTIONS,
} from './banner-types'

interface BannerFormProps {
  form: FormState
  update: <K extends keyof FormState>(key: K, val: FormState[K]) => void
  toggleDevice: (device: string) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  editing: boolean
}

export function BannerForm({ form, update, toggleDevice, onSave, onCancel, saving, editing }: BannerFormProps) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-fg">{editing ? 'Edit banner' : 'New banner'}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-fg-muted hover:bg-muted"><X className="h-4 w-4" /></button>
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
        <button onClick={onCancel} className="px-4 py-2 text-sm text-fg-muted hover:text-fg rounded-lg border border-hairline hover:bg-muted transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : editing ? 'Update banner' : 'Create banner'}
        </button>
      </div>
    </div>
  )
}
