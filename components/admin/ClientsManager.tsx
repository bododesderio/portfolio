'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  website: string | null
  visible: boolean
  order: number
}

export function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', website: '' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/admin/clients/${editing.id}` : '/api/admin/clients', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Saved!')
      setEditing(null)
      setForm({ name: '', website: '' })
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
    await fetch(`/api/admin/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !client.visible }),
    })
    router.refresh()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-card rounded-2xl border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left px-6 py-4 text-ink-500 font-medium">Name</th>
              <th className="text-left px-6 py-4 text-ink-500 font-medium">Visible</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {initialClients.map(c => (
              <tr key={c.id} className="border-b border-hairline last:border-0">
                <td className="px-6 py-4">
                  <p className="font-medium text-fg">{c.name}</p>
                  {c.website && <p className="text-xs text-ink-400 truncate max-w-[200px]">{c.website}</p>}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleVisible(c)}
                    className={`w-10 h-5 rounded-full transition-colors ${c.visible ? 'bg-brand' : 'bg-ink-300 dark:bg-ink-700'}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setEditing(c); setForm({ name: c.name, website: c.website || '' }) }} className="text-brand text-sm hover:underline">Edit</button>
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
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Client name"
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="Website URL"
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
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
              <button onClick={() => { setEditing(null); setForm({ name: '', website: '' }) }} className="px-4 py-3 bg-muted rounded-full text-sm">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
