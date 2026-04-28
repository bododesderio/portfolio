'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { MediaPickerField } from './MediaPickerField'

interface Service {
  id: string
  title: string
  description: string
  icon: string
  imageUrl: string | null
  imageAlt: string | null
  homeFeatured: boolean
  visible: boolean
}

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: 'code', imageUrl: '', imageAlt: '', homeFeatured: true })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved!')
      setEditing(null)
      setForm({ title: '', description: '', icon: 'code', imageUrl: '', imageAlt: '', homeFeatured: true })
      router.refresh()
    } catch {
      toast.error('Failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    if (res.ok) { router.refresh(); toast.success('Deleted.') }
    else toast.error('Failed.')
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {initialServices.map(s => (
          <div key={s.id} className="bg-card rounded-2xl border border-hairline p-6">
            <div className="flex gap-4">
              {s.imageUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-hairline bg-muted flex-shrink-0">
                  <Image src={s.imageUrl} alt={s.imageAlt || s.title} fill className="object-cover" sizes="80px" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fg mb-1">{s.title}</p>
                <p className="text-fg-muted text-sm mb-4 line-clamp-2">{s.description}</p>
                <div className="flex gap-3">
                  <button onClick={() => { setEditing(s); setForm({ title: s.title, description: s.description, icon: s.icon, imageUrl: s.imageUrl || '', imageAlt: s.imageAlt || '', homeFeatured: s.homeFeatured }) }} className="text-brand text-sm hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-hairline p-6">
        <h2 className="font-serif text-xl text-fg mb-6">
          {editing ? 'Edit Service' : 'Add Service'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Software Development"
              className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="What this service includes and who it's for..."
              className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Icon</label>
            <select
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              className="w-full px-4 py-3 select-styled"
            >
              <option value="code">Code</option>
              <option value="building">Building</option>
              <option value="users">Users</option>
              <option value="trending-up">Trending Up</option>
              <option value="lightbulb">Lightbulb</option>
            </select>
          </div>
          <MediaPickerField
            label="Service Image"
            value={form.imageUrl}
            onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
            placeholder="Pick or paste a service image..."
          />
          {form.imageUrl && (
            <div>
              <label className="block text-xs text-fg-muted mb-1">Image Alt Text</label>
              <input
                value={form.imageAlt}
                onChange={e => setForm(f => ({ ...f, imageAlt: e.target.value }))}
                placeholder="Describe the service image..."
                className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.homeFeatured}
              onChange={e => setForm(f => ({ ...f, homeFeatured: e.target.checked }))}
              className="w-4 h-4 accent-brand"
            />
            <span className="text-sm text-fg-muted">Show on home page</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-full transition-colors"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ title: '', description: '', icon: 'code', imageUrl: '', imageAlt: '', homeFeatured: true }) }} className="px-4 py-3 bg-muted rounded-full text-sm">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
