'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { MediaPickerField, type PickedMedia } from './MediaPickerField'

interface HeroImage {
  id: string
  order: number
  active: boolean
  media: {
    id: string
    url: string
    altText?: string | null
  }
}

export function HeroImagesManager({ initialItems }: { initialItems: HeroImage[] }) {
  const [items, setItems] = useState<HeroImage[]>(initialItems)
  const [mediaUrl, setMediaUrl] = useState('')

  const handleAdd = useCallback(async (picked: PickedMedia) => {
    if (!picked.mediaId) { toast.error('Pick an image from the media library.'); return }
    try {
      const res = await fetch('/api/admin/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: picked.mediaId }),
      })
      if (!res.ok) throw new Error()
      const item = await res.json()
      setItems(prev => [...prev, item])
      setMediaUrl('')
      toast.success('Hero image added.')
    } catch {
      toast.error('Failed to add hero image.')
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/hero-images/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Hero image removed.')
    } catch {
      toast.error('Failed to remove.')
    }
  }, [])

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/hero-images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      if (!res.ok) throw new Error()
      setItems(prev => prev.map(i => i.id === id ? { ...i, active: !active } : i))
    } catch {
      toast.error('Failed to update.')
    }
  }, [])

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg text-fg">Hero Background Images</h2>
          <p className="text-sm text-fg-muted mt-1">Images rotate every 15 seconds on the home hero section.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-fg-muted text-center py-8">No hero images. Add one below.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`group relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-colors ${
                item.active ? 'border-brand' : 'border-hairline opacity-50'
              }`}
            >
              <Image
                src={item.media.url}
                alt={item.media.altText || `Hero image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => toggleActive(item.id, item.active)}
                  className="p-2 rounded-full bg-white/90 text-ink text-xs font-medium hover:bg-white"
                >
                  {item.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white font-mono">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-hairline pt-4">
        <p className="text-sm font-medium text-fg-muted mb-2">Add hero image</p>
        <MediaPickerField
          value={mediaUrl}
          onChange={setMediaUrl}
          onPick={handleAdd}
          mode="image"
          placeholder="Pick from media library or upload"
        />
      </div>
    </div>
  )
}
