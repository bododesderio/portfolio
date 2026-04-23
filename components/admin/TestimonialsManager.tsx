'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
interface Testimonial {
  id: string
  body: string
  author: string
  role: string
  company: string | null
  visible: boolean
  pages: string[]
}

export function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialTestimonials)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ body: '', author: '', role: '', company: '', pages: 'home' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, pages: form.pages.split(',').map(p => p.trim()) }
      const res = await fetch(editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved!')
      setEditing(null)
      setForm({ body: '', author: '', role: '', company: '', pages: 'home' })
      router.refresh()
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) { setItems(prev => prev.filter(t => t.id !== id)); toast.success('Deleted.') }
    else toast.error('Failed.')
  }

  function startEdit(t: Testimonial) {
    setEditing(t)
    setForm({ body: t.body, author: t.author, role: t.role, company: t.company || '', pages: t.pages.join(', ') })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {items.map(t => (
          <div key={t.id} className="bg-card rounded-2xl border border-hairline p-6">
            <p className="text-fg-muted italic mb-4 text-sm">&ldquo;{t.body}&rdquo;</p>
            <p className="font-semibold text-fg text-sm">{t.author}</p>
            <p className="text-ink-500 text-xs">{t.role}{t.company && `, ${t.company}`}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => startEdit(t)} className="text-brand text-sm hover:underline">Edit</button>
              <button onClick={() => handleDelete(t.id)} className="text-red-500 text-sm hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-hairline p-6">
        <h2 className="font-serif text-xl text-fg mb-6">
          {editing ? 'Edit Testimonial' : 'Add Testimonial'}
        </h2>
        <div className="space-y-4">
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={4}
            placeholder="Quote..."
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none text-sm"
          />
          {(['author', 'role', 'company'] as const).map(field => (
            <input
              key={field}
              value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
            />
          ))}
          <input
            value={form.pages}
            onChange={e => setForm(f => ({ ...f, pages: e.target.value }))}
            placeholder="Pages (comma-separated: home, about)"
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-full transition-colors"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(null); setForm({ body: '', author: '', role: '', company: '', pages: 'home' }) }}
                className="px-4 py-3 bg-muted rounded-full text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
