'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical } from 'lucide-react'

export type NavLink = {
  label: string
  href: string
  visible: boolean
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', href: '/', visible: true },
  { label: 'About', href: '/about', visible: true },
  { label: 'Services', href: '/services', visible: true },
  { label: 'Projects', href: '/projects', visible: true },
  { label: 'Gallery', href: '/gallery', visible: true },
  { label: 'Blog', href: '/blog', visible: true },
  { label: 'Contact', href: '/contact', visible: true },
]

export function NavigationEditor({ initialLinks }: { initialLinks: NavLink[] | null }) {
  const [links, setLinks] = useState<NavLink[]>(initialLinks ?? DEFAULT_LINKS)
  const [saving, setSaving] = useState(false)

  function updateLink(index: number, field: keyof NavLink, value: string | boolean) {
    setLinks(prev => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  function addLink() {
    setLinks(prev => [...prev, { label: '', href: '/', visible: true }])
  }

  function removeLink(index: number) {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  function moveLink(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= links.length) return
    setLinks(prev => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function save() {
    // Validate
    for (const link of links) {
      if (!link.label.trim()) {
        toast.error('Every link must have a label.')
        return
      }
      if (!link.href.trim()) {
        toast.error('Every link must have an href.')
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nav.links', value: JSON.stringify(links) }),
      })
      if (!res.ok) throw new Error()
      toast.success('Navigation saved.')
    } catch {
      toast.error('Failed to save navigation.')
    } finally {
      setSaving(false)
    }
  }

  function resetToDefaults() {
    setLinks(DEFAULT_LINKS)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg text-fg">Menu items</h2>
          <span className="text-xs text-fg-muted">{links.length} item{links.length !== 1 ? 's' : ''}</span>
        </div>

        {links.length === 0 ? (
          <p className="text-sm text-fg-muted text-center py-8">No menu items. Add one below.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl border border-hairline p-3 transition-colors ${
                  link.visible ? 'bg-muted' : 'bg-muted/50 opacity-60'
                }`}
              >
                <GripVertical className="h-4 w-4 text-fg-muted flex-shrink-0" />

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-fg-muted mb-1">Label</label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={e => updateLink(index, 'label', e.target.value)}
                      placeholder="Page name"
                      className="w-full px-3 py-2 bg-surface border border-hairline rounded-lg text-fg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-fg-muted mb-1">Href</label>
                    <input
                      type="text"
                      value={link.href}
                      onChange={e => updateLink(index, 'href', e.target.value)}
                      placeholder="/page-slug"
                      className="w-full px-3 py-2 bg-surface border border-hairline rounded-lg text-fg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updateLink(index, 'visible', !link.visible)}
                    className="p-1.5 rounded-lg hover:bg-surface text-fg-muted transition-colors"
                    aria-label={link.visible ? 'Hide link' : 'Show link'}
                    title={link.visible ? 'Visible' : 'Hidden'}
                  >
                    {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-surface text-fg-muted disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === links.length - 1}
                    className="p-1.5 rounded-lg hover:bg-surface text-fg-muted disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-fg-muted hover:text-rose-500 transition-colors"
                    aria-label="Delete link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-hairline rounded-lg text-sm text-fg-muted hover:text-fg hover:border-brand transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add link
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2.5 text-sm text-fg-muted hover:text-fg transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save navigation'}
        </button>
      </div>
    </div>
  )
}
