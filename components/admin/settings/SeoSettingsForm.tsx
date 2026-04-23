'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

type SeoPage = { page: string; metaTitle: string | null; metaDesc: string | null }

export function SeoSettingsForm({ pages }: { pages: SeoPage[] }) {
  return (
    <div className="space-y-4">
      {pages.length === 0 && <p className="text-sm text-fg-muted">No SEO rows yet. Run the seed to populate.</p>}
      {pages.map(p => <SeoPageCard key={p.page} page={p} />)}
    </div>
  )
}

function SeoPageCard({ page }: { page: SeoPage }) {
  const [title, setTitle] = useState(page.metaTitle || '')
  const [desc, setDesc] = useState(page.metaDesc || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page.page, metaTitle: title, metaDesc: desc }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Saved ${page.page}.`)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-fg uppercase tracking-widest">{page.page}</p>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-1.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-xs rounded-lg"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-fg-muted mb-1">Meta title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-fg-muted mb-1">Meta description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm resize-none"
          />
        </div>
      </div>
    </div>
  )
}
