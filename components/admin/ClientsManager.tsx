'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'
import { MediaPickerField, type PickedMedia } from './MediaPickerField'

interface Client {
  id: string
  name: string
  website: string | null
  visible: boolean
  order: number
  logoUrl: string | null
  logoMediaId: string | null
}

export function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', website: '', logoMediaId: '' })
  const [logoPreview, setLogoPreview] = useState('')
  const [saving, setSaving] = useState(false)

  function handleLogoPick(picked: PickedMedia) {
    setForm(f => ({ ...f, logoMediaId: picked.mediaId || '' }))
    setLogoPreview(picked.url)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Client name is required.'); return }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: form.name.trim(), website: form.website || null }
      if (form.logoMediaId) payload.logoMediaId = form.logoMediaId
      const res = await fetch(editing ? `/api/admin/clients/${editing.id}` : '/api/admin/clients', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved!')
      setEditing(null)
      setForm({ name: '', website: '', logoMediaId: '' })
      setLogoPreview('')
      router.refresh()
    } catch {
      toast.error('Failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client?')) return
    const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
    if (res.ok) { router.refresh(); toast.success('Deleted.') }
    else toast.error('Failed.')
  }

  async function toggleVisible(client: Client) {
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !client.visible }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast.error('Failed to update visibility.')
    }
  }

  function startEdit(c: Client) {
    setEditing(c)
    setForm({ name: c.name, website: c.website || '', logoMediaId: c.logoMediaId || '' })
    setLogoPreview(c.logoUrl || '')
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ name: '', website: '', logoMediaId: '' })
    setLogoPreview('')
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-card rounded-2xl border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left px-6 py-4 text-fg-muted font-medium">Client</th>
              <th className="text-left px-6 py-4 text-fg-muted font-medium">Visible</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {initialClients.map(c => (
              <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted border border-hairline flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.logoUrl ? (
                        <Image src={c.logoUrl} alt={c.name} width={40} height={40} className="object-contain" unoptimized />
                      ) : (
                        <Building2 className="h-4 w-4 text-fg-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{c.name}</p>
                      {c.website && <p className="text-xs text-fg-muted truncate max-w-[200px]">{c.website}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleVisible(c)}
                    className={`w-10 h-5 rounded-full transition-colors ${c.visible ? 'bg-brand' : 'bg-ink-300 dark:bg-ink-700'}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => startEdit(c)} className="text-brand text-sm hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-2xl border border-hairline p-6">
        <h2 className="font-serif text-xl text-fg mb-6">
          {editing ? 'Edit Client' : 'Add Client'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1">Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Client or company name"
              className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Website</label>
            <input
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <MediaPickerField
              label="Logo"
              value={logoPreview}
              onChange={() => {}}
              onPick={handleLogoPick}
              placeholder="Pick or upload a logo..."
              mode="image"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button onClick={cancelEdit} className="px-4 py-3 bg-muted rounded-full text-sm text-fg-muted">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
