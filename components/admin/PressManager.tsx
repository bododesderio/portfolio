'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MediaPickerField } from './MediaPickerField'

interface PressItem {
  id: string
  type: string
  title: string
  description: string
  source: string
  sourceUrl: string | null
  imageUrl: string | null
  imageAlt: string | null
  externalUrl: string | null
  downloadUrl: string | null
  date: string | null
  visible: boolean
  order: number
}

const EMPTY_FORM = {
  type: 'article' as string,
  title: '',
  description: '',
  source: '',
  sourceUrl: '',
  imageUrl: '',
  imageAlt: '',
  externalUrl: '',
  downloadUrl: '',
  date: '',
  visible: true,
}

const TYPE_OPTIONS = [
  { value: 'essay', label: 'Essay' },
  { value: 'article', label: 'Article' },
  { value: 'award', label: 'Award' },
  { value: 'speaking', label: 'Speaking' },
]

const TYPE_COLORS: Record<string, string> = {
  essay: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  award: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  speaking: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
}

function itemToForm(item: PressItem) {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    source: item.source,
    sourceUrl: item.sourceUrl ?? '',
    imageUrl: item.imageUrl ?? '',
    imageAlt: item.imageAlt ?? '',
    externalUrl: item.externalUrl ?? '',
    downloadUrl: item.downloadUrl ?? '',
    date: item.date ?? '',
    visible: item.visible,
  }
}

export function PressManager({ initialItems }: { initialItems: PressItem[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<PressItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  function startAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function startEdit(item: PressItem) {
    setEditing(item)
    setForm(itemToForm(item))
    setShowForm(true)
  }

  function cancelForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim() || !form.source.trim()) {
      toast.error('Title, description, and source are required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        sourceUrl: form.sourceUrl || null,
        imageUrl: form.imageUrl || null,
        imageAlt: form.imageAlt || null,
        externalUrl: form.externalUrl || null,
        downloadUrl: form.downloadUrl || null,
        date: form.date || null,
      }

      const res = await fetch(
        editing ? `/api/admin/press/${editing.id}` : '/api/admin/press',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Request failed.')
      }

      toast.success(editing ? 'Updated!' : 'Created!')
      cancelForm()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this press item?')) return
    try {
      const res = await fetch(`/api/admin/press/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Deleted.')
      if (editing?.id === id) cancelForm()
      router.refresh()
    } catch {
      toast.error('Delete failed.')
    }
  }

  async function handleToggleVisible(item: PressItem) {
    try {
      const res = await fetch(`/api/admin/press/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !item.visible }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast.error('Toggle failed.')
    }
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = initialItems.findIndex(i => i.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= initialItems.length) return

    const current = initialItems[idx]
    const swap = initialItems[swapIdx]

    try {
      await Promise.all([
        fetch(`/api/admin/press/${current.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swap.order }),
        }),
        fetch(`/api/admin/press/${swap.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: current.order }),
        }),
      ])
      router.refresh()
    } catch {
      toast.error('Reorder failed.')
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left column: item list */}
      <div className="space-y-4">
        <button
          onClick={startAdd}
          className="w-full py-3 border-2 border-dashed border-hairline rounded-2xl text-sm font-medium text-fg-muted hover:border-brand hover:text-brand transition-colors"
        >
          + Add item
        </button>

        {initialItems.length === 0 && (
          <p className="text-sm text-fg-muted text-center py-8">No press items yet.</p>
        )}

        {initialItems.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-card rounded-2xl border border-hairline p-6 transition-colors ${
              editing?.id === item.id ? 'ring-2 ring-brand' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                      TYPE_COLORS[item.type] ?? 'bg-muted text-fg-muted'
                    }`}
                  >
                    {item.type}
                  </span>
                  {!item.visible && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-muted text-fg-muted">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="font-semibold text-fg truncate">{item.title}</p>
                <p className="text-sm text-fg-muted truncate">
                  {item.source}
                  {item.date ? ` \u00b7 ${item.date}` : ''}
                </p>
              </div>

              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleReorder(item.id, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 text-fg-muted"
                  aria-label="Move up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleReorder(item.id, 'down')}
                  disabled={idx === initialItems.length - 1}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 text-fg-muted"
                  aria-label="Move down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => startEdit(item)}
                className="text-brand text-sm hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleVisible(item)}
                className="text-fg-muted text-sm hover:underline"
              >
                {item.visible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right column: form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-hairline p-6 h-fit lg:sticky lg:top-8">
          <h2 className="font-serif text-xl text-fg mb-6">
            {editing ? 'Edit Press Item' : 'Add Press Item'}
          </h2>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Press item title"
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Brief description..."
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Source</label>
              <input
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder='e.g. "Daily Monitor", "@NDCUganda"'
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Source URL</label>
              <input
                value={form.sourceUrl}
                onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Image */}
            <MediaPickerField
              label="Image"
              value={form.imageUrl}
              onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
              placeholder="Pick or paste an image..."
            />

            {/* Image Alt */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Image Alt Text</label>
              <input
                value={form.imageAlt}
                onChange={e => setForm(f => ({ ...f, imageAlt: e.target.value }))}
                placeholder="Describe the image..."
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* External URL */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">External URL</label>
              <input
                value={form.externalUrl}
                onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                placeholder="https://... (link to article/page)"
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Download URL */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Download URL</label>
              <input
                value={form.downloadUrl}
                onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))}
                placeholder="https://... (downloadable file)"
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-fg-muted mb-1">Date</label>
              <input
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                placeholder='e.g. "2024", "March 2024"'
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Visible toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm text-fg-muted">Visible on site</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-full transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
              </button>
              <button
                onClick={cancelForm}
                className="px-4 py-3 bg-muted rounded-full text-sm text-fg-muted hover:text-fg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
