'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, Copy, Trash2, X, Star, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface GalleryInfo {
  id: string
  caption: string | null
  category: string | null
  featured: boolean
}

interface MediaItem {
  id: string
  filename: string
  url: string
  type: string
  altText: string | null
  uploadedAt: Date
  galleryItems?: GalleryInfo[]
}

type Tab = 'all' | 'gallery'

export function MediaLibrary({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [tab, setTab] = useState<Tab>('all')

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error()
        const item = await res.json()
        setMedia(prev => [{ ...item, galleryItems: [] }, ...prev])
        toast.success(`${file.name} uploaded.`)
      } catch {
        toast.error(`Failed to upload ${file.name}.`)
      }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  async function handleDelete(id: string) {
    if (!confirm('Delete this file?')) return
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMedia(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Deleted.')
    } else {
      toast.error('Failed to delete.')
    }
  }

  async function toggleGallery(item: MediaItem) {
    const isInGallery = (item.galleryItems?.length ?? 0) > 0
    if (isInGallery) {
      // Remove from gallery
      const galleryId = item.galleryItems![0].id
      const res = await fetch(`/api/admin/gallery/${galleryId}`, { method: 'DELETE' })
      if (res.ok) {
        setMedia(prev => prev.map(m => m.id === item.id ? { ...m, galleryItems: [] } : m))
        if (selected?.id === item.id) setSelected(s => s ? { ...s, galleryItems: [] } : s)
        toast.success('Removed from gallery.')
      } else toast.error('Failed.')
    } else {
      // Add to gallery
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: item.id }),
      })
      if (res.ok) {
        const gi = await res.json()
        const info: GalleryInfo = { id: gi.id, caption: gi.caption, category: gi.category, featured: gi.featured }
        setMedia(prev => prev.map(m => m.id === item.id ? { ...m, galleryItems: [info] } : m))
        if (selected?.id === item.id) setSelected(s => s ? { ...s, galleryItems: [info] } : s)
        toast.success('Added to gallery!')
      } else toast.error('Failed.')
    }
  }

  async function toggleFeatured(item: MediaItem) {
    if (!item.galleryItems?.length) return
    const gi = item.galleryItems[0]
    const res = await fetch(`/api/admin/gallery/${gi.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !gi.featured }),
    })
    if (res.ok) {
      const updated = { ...gi, featured: !gi.featured }
      setMedia(prev => prev.map(m => m.id === item.id ? { ...m, galleryItems: [updated] } : m))
      if (selected?.id === item.id) setSelected(s => s ? { ...s, galleryItems: [updated] } : s)
    }
  }

  const isInGallery = (item: MediaItem) => (item.galleryItems?.length ?? 0) > 0
  const isFeatured = (item: MediaItem) => item.galleryItems?.[0]?.featured ?? false

  const displayMedia = tab === 'gallery' ? media.filter(isInGallery) : media
  const galleryCount = media.filter(isInGallery).length

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-hairline">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'all' ? 'border-brand text-brand' : 'border-transparent text-fg-muted hover:text-fg'
          }`}
        >
          All Media
        </button>
        <button
          onClick={() => setTab('gallery')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
            tab === 'gallery' ? 'border-brand text-brand' : 'border-transparent text-fg-muted hover:text-fg'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Gallery ({galleryCount})
        </button>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors mb-8 ${
          isDragActive
            ? 'border-brand bg-brand/5'
            : 'border-hairline hover:border-brand'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-ink-400 mx-auto mb-3" />
        <p className="text-fg-muted">
          {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop images, or click to select'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayMedia.map(item => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
              selected?.id === item.id ? 'border-brand' : 'border-transparent hover:border-ink-300'
            }`}
          >
            <Image src={item.url} alt={item.altText || item.filename} fill className="object-cover" />
            {isInGallery(item) && (
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                <span className="px-1.5 py-0.5 bg-brand/90 text-white text-[10px] font-medium rounded-md backdrop-blur-sm">
                  Gallery
                </span>
                {isFeatured(item) && (
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-hairline p-6 shadow-xl z-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-fg">File details</h3>
            <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-ink-500" /></button>
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
            <Image src={selected.url} alt={selected.altText || ''} fill className="object-cover" />
          </div>
          <p className="text-sm text-fg-muted mb-1 truncate">{selected.filename}</p>
          <p className="text-xs text-ink-400 mb-4">{new Date(selected.uploadedAt).toLocaleDateString()}</p>

          {/* Gallery controls */}
          <div className="mb-4 p-3 rounded-xl bg-muted/50 space-y-2">
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wider">Gallery</p>
            <button
              onClick={() => toggleGallery(selected)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                isInGallery(selected)
                  ? 'bg-brand/10 text-brand hover:bg-brand/20'
                  : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              {isInGallery(selected) ? 'Remove from Gallery' : 'Add to Gallery'}
            </button>
            {isInGallery(selected) && (
              <button
                onClick={() => toggleFeatured(selected)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFeatured(selected)
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                <Star className="h-4 w-4" />
                {isFeatured(selected) ? 'Unfeature' : 'Feature in Gallery'}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { navigator.clipboard.writeText(selected.url); toast.success('URL copied!') }}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-lg text-sm hover:bg-ink-200 dark:hover:bg-ink-700 transition-colors"
            >
              <Copy className="h-4 w-4" /> Copy URL
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
