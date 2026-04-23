'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Eye, EyeOff, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Embed {
  id: string
  page: string
  section: string
  sortOrder: number
  platform: string
  postId: string
  originalUrl: string
  caption: string | null
  isPublished: boolean
}

const PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'vimeo']

const platformLabels: Record<string, string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
}

const platformColors: Record<string, string> = {
  twitter: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  linkedin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  facebook: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  tiktok: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  youtube: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  vimeo: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

function detectPlatform(url: string): { platform: string; postId: string } | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')

    if (host.includes('twitter.com') || host.includes('x.com')) {
      const match = u.pathname.match(/\/status\/(\d+)/)
      return match ? { platform: 'twitter', postId: match[1] } : null
    }
    if (host.includes('instagram.com')) {
      const match = u.pathname.match(/\/(p|reel)\/([^/]+)/)
      return match ? { platform: 'instagram', postId: match[2] } : null
    }
    if (host.includes('linkedin.com')) {
      const match = u.pathname.match(/\/posts\/([^/]+)/) || u.pathname.match(/\/feed\/update\/([^/]+)/)
      return match ? { platform: 'linkedin', postId: match[1] } : null
    }
    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      return v ? { platform: 'youtube', postId: v } : null
    }
    if (host.includes('youtu.be')) {
      return { platform: 'youtube', postId: u.pathname.slice(1) }
    }
    if (host.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      return match ? { platform: 'vimeo', postId: match[1] } : null
    }
    if (host.includes('tiktok.com')) {
      const match = u.pathname.match(/\/video\/(\d+)/)
      return match ? { platform: 'tiktok', postId: match[1] } : null
    }
    if (host.includes('facebook.com')) {
      return { platform: 'facebook', postId: u.pathname }
    }
  } catch { /* invalid URL */ }
  return null
}

export function EmbedManager({ page, initialEmbeds }: { page: string; initialEmbeds: Embed[] }) {
  const [embeds, setEmbeds] = useState(initialEmbeds)
  const [newUrl, setNewUrl] = useState('')
  const [newSection, setNewSection] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [adding, setAdding] = useState(false)

  const sections = [...new Set(embeds.map(e => e.section))].sort()

  async function handleAdd() {
    const section = newSection.trim().toLowerCase().replace(/\s+/g, '-')
    if (!section || !newUrl.trim()) {
      toast.error('Section and URL are required.')
      return
    }

    const detected = detectPlatform(newUrl)
    if (!detected) {
      toast.error('Could not detect platform from URL. Supported: Twitter, Instagram, LinkedIn, YouTube, Vimeo, TikTok, Facebook.')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/admin/page-embeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          section,
          platform: detected.platform,
          postId: detected.postId,
          originalUrl: newUrl.trim(),
          caption: newCaption.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const embed = await res.json()
      setEmbeds(prev => [...prev, embed])
      setNewUrl('')
      setNewCaption('')
      toast.success('Embed added!')
    } catch {
      toast.error('Failed to add embed.')
    }
    setAdding(false)
  }

  async function togglePublished(embed: Embed) {
    const res = await fetch(`/api/admin/page-embeds/${embed.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !embed.isPublished }),
    })
    if (res.ok) {
      setEmbeds(prev => prev.map(e => e.id === embed.id ? { ...e, isPublished: !e.isPublished } : e))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this embed?')) return
    const res = await fetch(`/api/admin/page-embeds/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEmbeds(prev => prev.filter(e => e.id !== id))
      toast.success('Deleted.')
    }
  }

  const grouped = sections.reduce<Record<string, Embed[]>>((acc, sec) => {
    acc[sec] = embeds.filter(e => e.section === sec).sort((a, b) => a.sortOrder - b.sortOrder)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Add embed form */}
      <div className="p-4 rounded-xl border border-hairline bg-muted/30 space-y-3">
        <h3 className="text-sm font-semibold text-fg">Add Embed</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-fg-muted mb-1 block">Section</label>
            <input
              type="text"
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              placeholder="e.g. testimonials, press-mentions"
              list="embed-sections"
              className="w-full px-3 py-2 rounded-lg border border-hairline bg-card text-sm text-fg focus:border-brand focus:outline-none"
            />
            <datalist id="embed-sections">
              {sections.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="text-xs text-fg-muted mb-1 block">URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="Paste post URL..."
              className="w-full px-3 py-2 rounded-lg border border-hairline bg-card text-sm text-fg focus:border-brand focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Caption (optional)</label>
          <input
            type="text"
            value={newCaption}
            onChange={e => setNewCaption(e.target.value)}
            placeholder="Optional caption..."
            className="w-full px-3 py-2 rounded-lg border border-hairline bg-card text-sm text-fg focus:border-brand focus:outline-none"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {adding ? 'Adding...' : 'Add Embed'}
        </button>
      </div>

      {/* Grouped embeds */}
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section}>
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-3">
            {section.replace(/-/g, ' ')}
          </h3>
          <div className="space-y-2">
            {items.map(embed => (
              <div
                key={embed.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  embed.isPublished ? 'border-hairline bg-card' : 'border-dashed border-ink-300 bg-muted/30 opacity-60'
                }`}
              >
                <GripVertical className="h-4 w-4 text-ink-400 flex-shrink-0 cursor-grab" />
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${platformColors[embed.platform] || 'bg-gray-100 text-gray-700'}`}>
                  {platformLabels[embed.platform] || embed.platform}
                </span>
                <span className="text-sm text-fg truncate flex-1">{embed.caption || embed.originalUrl}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={embed.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-ink-400 hover:text-fg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => togglePublished(embed)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-fg hover:bg-muted transition-colors"
                    title={embed.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {embed.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(embed.id)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {embeds.length === 0 && (
        <p className="text-sm text-fg-muted text-center py-8">
          No embeds yet. Add one above to get started.
        </p>
      )}
    </div>
  )
}
