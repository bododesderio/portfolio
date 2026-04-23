'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Star, Trash2 } from 'lucide-react'

interface GalleryItem {
  id: string
  caption: string | null
  category: string | null
  featured: boolean
  media: { id: string; url: string; altText: string | null }
}

export function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems)

  async function toggleFeatured(item: GalleryItem) {
    const res = await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !item.featured }),
    })
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove from gallery?')) return
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    if (res.ok) { setItems(prev => prev.filter(i => i.id !== id)); toast.success('Removed.') }
    else toast.error('Failed.')
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square">
          <Image src={item.media.url} alt={item.caption || ''} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => toggleFeatured(item)}
                className={`p-1.5 rounded-lg transition-colors ${item.featured ? 'bg-brand text-white' : 'bg-white/20 text-white hover:bg-brand'}`}
                title="Toggle featured"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {item.category && (
                <span className="ml-auto text-xs text-white/80 self-center">{item.category}</span>
              )}
            </div>
          </div>
          {item.featured && (
            <div className="absolute top-2 left-2">
              <Star className="h-4 w-4 text-brand fill-brand" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
