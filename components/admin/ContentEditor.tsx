'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor').then(m => m.RichTextEditor), { ssr: false, loading: () => <div className="border border-hairline rounded-lg bg-muted animate-pulse h-32" /> })
import { ChevronDown, ChevronUp, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { MediaPickerField } from './MediaPickerField'

interface ContentRow {
  id: string
  page: string
  section: string
  fieldKey: string
  value: string
  fieldType: string
  updatedAt: Date
}

interface ContentEditorProps {
  page: string
  initialRows: ContentRow[]
}

function groupBySection(rows: ContentRow[]): Record<string, ContentRow[]> {
  return rows.reduce<Record<string, ContentRow[]>>((acc, row) => {
    if (!acc[row.section]) acc[row.section] = []
    acc[row.section].push(row)
    return acc
  }, {})
}

// ---------------------------------------------------------------------------
// Visual JSON array editor — renders structured form fields for known shapes
// ---------------------------------------------------------------------------
function JsonFieldEditor({ value, onChange, fieldKey }: { value: string; onChange: (v: string) => void; fieldKey: string }) {
  const [showRaw, setShowRaw] = useState(false)

  let items: Record<string, string>[] = []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) items = parsed
  } catch {
    // Invalid JSON — show raw editor
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder='[{"key": "value"}]'
        className="w-full px-4 py-3 bg-transparent text-fg font-mono text-xs focus:outline-none resize-y"
      />
    )
  }

  if (items.length === 0 && !value.trim()) {
    items = []
  }

  // Detect field shape from first item or known field keys
  const knownShapes: Record<string, string[]> = {
    steps: ['icon', 'title', 'desc'],
    items: ['value', 'suffix', 'label'],
    roles: ['title', 'org', 'period'],
    links: ['label', 'url'],
    features: ['title', 'description'],
  }

  const shape = knownShapes[fieldKey] || (items.length > 0 ? Object.keys(items[0]) : ['key', 'value'])

  function updateItem(index: number, key: string, val: string) {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: val }
    onChange(JSON.stringify(updated))
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    onChange(JSON.stringify(updated))
  }

  function addItem() {
    const empty: Record<string, string> = {}
    shape.forEach(k => (empty[k] = ''))
    onChange(JSON.stringify([...items, empty]))
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return
    const updated = [...items]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(JSON.stringify(updated))
  }

  // Field-specific placeholders
  const placeholders: Record<string, Record<string, string>> = {
    steps: { icon: 'search, map, code...', title: 'Step name', desc: 'Step description' },
    items: { value: '8', suffix: '+', label: 'Clients served' },
    roles: { title: 'Founder & CEO', org: 'Company Name', period: '2022 - Present' },
  }
  const ph = placeholders[fieldKey] || {}

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-muted">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <button
          type="button"
          onClick={() => setShowRaw(r => !r)}
          className="text-[10px] font-mono text-fg-muted hover:text-fg px-2 py-0.5 rounded bg-muted"
        >
          {showRaw ? 'Visual' : 'Raw JSON'}
        </button>
      </div>

      {showRaw ? (
        <textarea
          value={JSON.stringify(items, null, 2)}
          onChange={e => {
            try { JSON.parse(e.target.value); onChange(e.target.value) } catch { onChange(e.target.value) }
          }}
          rows={Math.max(6, items.length * 4)}
          className="w-full px-3 py-2 bg-muted rounded-lg text-fg font-mono text-xs focus:outline-none resize-y border border-hairline"
        />
      ) : (
        <>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start p-3 rounded-xl bg-muted/50 border border-hairline">
              <div className="flex flex-col gap-1 pt-1">
                <button type="button" onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0} className="text-ink-400 hover:text-fg disabled:opacity-20"><ChevronUp className="h-3 w-3" /></button>
                <GripVertical className="h-3 w-3 text-ink-300 mx-auto" />
                <button type="button" onClick={() => moveItem(idx, idx + 1)} disabled={idx === items.length - 1} className="text-ink-400 hover:text-fg disabled:opacity-20"><ChevronDown className="h-3 w-3" /></button>
              </div>
              <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: shape.length <= 3 ? `repeat(${shape.length}, 1fr)` : 'repeat(2, 1fr)' }}>
                {shape.map(key => (
                  <div key={key}>
                    <label className="block text-[10px] text-fg-muted mb-0.5 capitalize">{key}</label>
                    {(key === 'desc' || key === 'description') ? (
                      <textarea
                        value={item[key] || ''}
                        onChange={e => updateItem(idx, key, e.target.value)}
                        rows={2}
                        placeholder={ph[key] || key}
                        className="w-full px-2 py-1.5 bg-card border border-hairline rounded-lg text-xs text-fg focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                      />
                    ) : (
                      <input
                        value={item[key] || ''}
                        onChange={e => updateItem(idx, key, e.target.value)}
                        placeholder={ph[key] || key}
                        className="w-full px-2 py-1.5 bg-card border border-hairline rounded-lg text-xs text-fg focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="p-1 text-ink-400 hover:text-red-500 mt-1"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand hover:bg-brand/5 rounded-lg transition-colors"
          >
            <Plus className="h-3 w-3" /> Add item
          </button>
        </>
      )}
    </div>
  )
}

function FieldEditor({ row, page }: { row: ContentRow; page: string }) {
  const [value, setValue] = useState(row.value)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          section: row.section,
          field_key: row.fieldKey,
          value,
          field_type: row.fieldType,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLastSaved(new Date(data.updated_at))
      toast.success('Saved!')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }, [page, row.section, row.fieldKey, row.fieldType, value])

  const label = row.fieldKey.replace(/_/g, ' ')

  return (
    <div className="border border-hairline rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-fg-muted capitalize">{label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-fg-muted">
            {row.fieldType}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-ink-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-card">
        {row.fieldType === 'html' ? (
          <RichTextEditor value={value} onChange={setValue} minHeight={120} />
        ) : row.fieldType === 'json' ? (
          <JsonFieldEditor value={value} onChange={setValue} fieldKey={row.fieldKey} />
        ) : row.fieldType === 'bool' ? (
          <div className="px-4 py-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={e => setValue(e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm text-fg-muted">Enabled</span>
            </label>
          </div>
        ) : row.fieldType === 'image' ? (
          <div className="px-4 py-3">
            <MediaPickerField value={value} onChange={setValue} />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={value.length > 120 ? 4 : 2}
            placeholder={`Enter ${label}...`}
            className="w-full px-4 py-3 bg-transparent text-fg text-sm focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  )
}

function SectionGroup({ section, rows, page }: { section: string; rows: ContentRow[]; page: string }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-card rounded-2xl border border-hairline overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
      >
        <h2 className="font-serif text-xl text-fg capitalize">{section}</h2>
        {open ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-hairline pt-4">
          {rows.map(row => (
            <FieldEditor key={row.id} row={row} page={page} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ContentEditor({ page, initialRows }: ContentEditorProps) {
  const grouped = groupBySection(initialRows)

  if (initialRows.length === 0) {
    return (
      <div className="text-center py-24 text-ink-500">
        <p className="text-lg mb-2">No content rows found for <strong>{page}</strong>.</p>
        <p className="text-sm">Run the seed to populate content, or add rows via the API.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([section, rows]) => (
        <SectionGroup key={section} section={section} rows={rows} page={page} />
      ))}
    </div>
  )
}
