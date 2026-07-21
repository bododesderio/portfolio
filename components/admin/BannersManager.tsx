'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import {
  Banner, FormState, EMPTY_FORM, bannerToForm, formToPayload,
} from './banners/banner-types'
import { BannerForm } from './banners/BannerForm'
import { BannerList } from './banners/BannerList'

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
        <BannerForm
          form={form}
          update={update}
          toggleDevice={toggleDevice}
          onSave={save}
          onCancel={cancel}
          saving={saving}
          editing={!!editing}
        />
      )}

      {/* List */}
      <BannerList
        items={items}
        expanded={expanded}
        onToggleExpand={setExpanded}
        onEdit={startEdit}
        onToggleEnabled={toggleEnabled}
        onDuplicate={duplicate}
        onRemove={remove}
      />
    </div>
  )
}
