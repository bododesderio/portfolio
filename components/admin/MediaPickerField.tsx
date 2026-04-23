'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, X, Check, Loader2 } from 'lucide-react'
import { detectMediaFromUrl, type DetectedMedia } from '@/lib/embed'

type Mode = 'library' | 'upload' | 'url' | 'stock'
export type PickerMode = 'image' | 'any'

export type PickedMedia = {
  type: 'image' | 'video' | 'embed' | 'doc'
  url: string
  alt?: string
  attribution?: { photographer?: string; source?: string; source_url?: string }
  embedUrl?: string
  embedHtml?: string
  provider?: string
}

interface MediaItem {
  id: string
  url: string
  filename: string
  altText: string | null
  type?: string
  width: number | null
  height: number | null
}

interface StockItem {
  id: string
  filename: string
  query: string
  photographer: string | null
  photographer_url: string | null
  source: string
  source_url: string | null
  width: number
  height: number
  alt: string
}

export function MediaPickerField({
  value,
  onChange,
  onPick,
  label,
  placeholder = 'Pick or paste an image…',
  mode = 'image',
}: {
  value: string
  onChange: (url: string) => void
  onPick?: (picked: PickedMedia) => void
  label?: string
  placeholder?: string
  mode?: PickerMode
}) {
  const [open, setOpen] = useState(false)

  function handlePicked(picked: PickedMedia) {
    onChange(picked.url)
    onPick?.(picked)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs text-fg-muted">{label}</label>}

      <div className="flex items-stretch gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-16 w-16 flex-shrink-0 rounded-lg border border-dashed border-hairline bg-muted overflow-hidden hover:border-brand transition-colors"
          aria-label="Open media picker"
        >
          {value ? (
            <Image src={value} alt="" fill className="object-cover" sizes="64px" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-fg-muted" />
            </div>
          )}
        </button>

        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg placeholder-fg-muted focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Browse
        </button>
      </div>

      {open && (
        <MediaPickerDialog
          currentValue={value}
          mode={mode}
          onPick={handlePicked}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Headless dialog-only picker — no preview tile, no URL field.
 * Use when you only want the modal flow (e.g. an editor toolbar "Insert media" button).
 */
export function MediaPickerDialogOnly({
  mode = 'any',
  onPick,
  onClose,
}: {
  mode?: PickerMode
  onPick: (picked: PickedMedia) => void
  onClose: () => void
}) {
  return (
    <MediaPickerDialog
      currentValue=""
      mode={mode}
      onPick={(p) => { onPick(p); onClose() }}
      onClose={onClose}
    />
  )
}

function MediaPickerDialog({
  currentValue,
  mode,
  onPick,
  onClose,
}: {
  currentValue: string
  mode: PickerMode
  onPick: (picked: PickedMedia) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<Mode>('library')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const tabs = [
    { id: 'library', label: 'Media library',      icon: ImageIcon },
    { id: 'upload',  label: 'Upload from device', icon: Upload },
    { id: 'url',     label: 'Paste URL / embed',  icon: LinkIcon },
    { id: 'stock',   label: 'Stock',              icon: Sparkles },
  ] as const

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Media picker"
        className="w-full max-w-5xl max-h-[88vh] bg-card rounded-2xl border border-hairline shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-hairline">
          <h2 className="font-serif text-xl text-fg">Select media</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-fg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-hairline bg-surface-2 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active ? 'bg-card text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-auto p-5">
          {tab === 'library' && <LibraryPanel mode={mode} currentValue={currentValue} onPick={onPick} />}
          {tab === 'upload'  && <UploadPanel  mode={mode} onPick={onPick} />}
          {tab === 'url'     && <UrlPanel     mode={mode} onPick={onPick} />}
          {tab === 'stock'   && <StockPanel   onPick={onPick} />}
        </div>
      </div>
    </div>
  )
}

function LibraryPanel({ mode, currentValue, onPick }: { mode: PickerMode; currentValue: string; onPick: (p: PickedMedia) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/media')
      .then(res => { if (!res.ok) throw new Error('Failed to load library'); return res.json() as Promise<MediaItem[]> })
      .then(data => { if (!cancelled) setItems(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  if (error) return <p className="text-sm text-rose-500">Couldn&apos;t load library: {error}</p>
  if (!items) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-fg-muted" /></div>

  const filterByMode = (it: MediaItem) => mode === 'image' ? (it.type ?? 'image') === 'image' : true
  const shown = (query
    ? items.filter(m => m.filename.toLowerCase().includes(query.toLowerCase()) || m.altText?.toLowerCase().includes(query.toLowerCase()))
    : items
  ).filter(filterByMode)

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ImageIcon className="h-10 w-10 text-fg-muted mx-auto mb-3 opacity-60" />
        <p className="text-sm text-fg-muted">Your media library is empty.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by filename or alt text…"
        className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {shown.length === 0 ? (
        <p className="text-sm text-fg-muted text-center py-8">No matches.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {shown.map(m => {
            const active = m.url === currentValue
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick({ type: 'image', url: m.url, alt: m.altText ?? m.filename })}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  active ? 'border-brand' : 'border-transparent hover:border-brand/50'
                }`}
              >
                <Image src={m.url} alt={m.altText || m.filename} fill sizes="240px" className="object-cover" unoptimized />
                {active && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-[10px] truncate">{m.filename}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const LIMITS = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024, doc: 25 * 1024 * 1024 }

function UploadPanel({ mode, onPick }: { mode: PickerMode; onPick: (p: PickedMedia) => void }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = mode === 'image' ? 'image/*' : 'image/*,video/mp4,video/webm,application/pdf'

  const handleUpload = useCallback(async (file: File) => {
    const kind: 'image' | 'video' | 'doc' = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'doc'
    if (mode === 'image' && kind !== 'image') { toast.error('Only images can be used here.'); return }
    if (file.size > LIMITS[kind]) {
      const mb = Math.round(LIMITS[kind] / (1024 * 1024))
      toast.error(`Too large. ${kind} limit is ${mb}MB.`)
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const media = await res.json() as MediaItem
      toast.success('Uploaded.')
      onPick({ type: kind, url: media.url, alt: media.altText ?? media.filename })
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }, [mode, onPick])

  return (
    <label
      htmlFor="mp-upload"
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
      className={`flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        dragOver ? 'border-brand bg-brand/5' : 'border-hairline hover:border-brand/60 hover:bg-muted'
      }`}
    >
      <input
        id="mp-upload"
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
      />
      {uploading ? (
        <>
          <Loader2 className="h-10 w-10 text-brand animate-spin mb-4" />
          <p className="text-sm text-fg-muted">Uploading…</p>
        </>
      ) : (
        <>
          <Upload className="h-10 w-10 text-fg-muted mb-4" />
          <p className="text-sm font-medium text-fg">Drop a file here or click to choose</p>
          <p className="text-xs text-fg-muted mt-1">
            {mode === 'image'
              ? 'PNG, JPG, WebP, AVIF, GIF · max 10MB'
              : 'Image 10MB · video (mp4, webm) 100MB · PDF 25MB'}
          </p>
        </>
      )}
    </label>
  )
}

function UrlPanel({ mode, onPick }: { mode: PickerMode; onPick: (p: PickedMedia) => void }) {
  const [url, setUrl] = useState('')
  const [detected, setDetected] = useState<DetectedMedia | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = url.trim()
    if (!trimmed) { setDetected(null); setError(null); return }
    if (!/^https?:\/\/.+/i.test(trimmed)) { setDetected(null); setError(null); return }
    const hit = detectMediaFromUrl(trimmed)
    setDetected(hit)
    setError(hit ? null : 'Unrecognised URL. Paste a direct image/video/PDF, or YouTube/Vimeo/Google Docs link.')
  }, [url])

  function submit() {
    if (!detected) { setError('Paste a valid URL first.'); return }
    if (mode === 'image' && detected.type !== 'image') { setError('This slot only accepts image URLs.'); return }
    if (detected.type === 'embed') {
      onPick({ type: 'embed', url: detected.url, embedUrl: detected.embedUrl, provider: detected.provider })
    } else {
      onPick({ type: detected.type, url: detected.url })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="mp-url" className="block text-xs text-fg-muted mb-1">URL</label>
        <div className="flex gap-2">
          <input
            id="mp-url"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            placeholder="https://…  ·  YouTube, Vimeo, direct image/video/PDF, Google Docs, Notion…"
            className="flex-1 px-3 py-2.5 bg-muted border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            disabled={!detected}
            className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg"
          >
            Use
          </button>
        </div>
        {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
      </div>

      {detected && <PreviewCard detected={detected} />}
    </div>
  )
}

function PreviewCard({ detected }: { detected: DetectedMedia }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-2 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-brand/10 text-brand rounded font-semibold">
          {detected.type}
        </span>
        {detected.type === 'embed' && detected.provider && (
          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-muted text-fg-muted rounded font-semibold">
            {detected.provider}
          </span>
        )}
      </div>
      {detected.type === 'image' && (
        <div className="relative aspect-video max-w-lg rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={detected.url} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
        </div>
      )}
      {detected.type === 'video' && (
        <video src={detected.url} controls className="max-w-lg rounded-lg bg-muted" />
      )}
      {detected.type === 'embed' && detected.embedUrl && (
        <div className="relative aspect-video max-w-lg rounded-lg overflow-hidden bg-muted">
          <iframe
            src={detected.embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embed preview"
          />
        </div>
      )}
      {detected.type === 'embed' && !detected.embedUrl && (
        <p className="text-xs text-fg-muted">A link-card preview will render on the published page.</p>
      )}
      {detected.type === 'doc' && (
        <p className="text-sm text-fg-muted break-all">
          <a href={detected.url} target="_blank" rel="noreferrer" className="text-brand hover:underline">{detected.url}</a>
        </p>
      )}
    </div>
  )
}

function StockPanel({ onPick }: { onPick: (p: PickedMedia) => void }) {
  const [items, setItems] = useState<StockItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/stock/manifest.json')
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (!cancelled) setItems(data.images ?? []) })
      .catch(() => { if (!cancelled) setError('Could not load stock manifest.') })
    return () => { cancelled = true }
  }, [])

  if (error) return <p className="text-sm text-rose-500">{error}</p>
  if (!items) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-fg-muted" /></div>

  if (items.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <Sparkles className="h-10 w-10 text-fg-muted mx-auto mb-3 opacity-60" />
        <p className="text-sm font-medium text-fg mb-1">Stock library is empty.</p>
        <p className="text-xs text-fg-muted mb-4">Get a free Unsplash developer key, then run:</p>
        <code className="block text-[11px] font-mono bg-muted text-fg px-3 py-2 rounded-lg">
          UNSPLASH_ACCESS_KEY=… node scripts/fetch-stock-pack.mjs
        </code>
        <p className="text-xs text-fg-muted mt-4">
          See <code className="text-[11px] bg-muted px-1 rounded">public/stock/README.md</code> for setup.
        </p>
      </div>
    )
  }

  const filtered = query
    ? items.filter(i =>
        i.query.toLowerCase().includes(query.toLowerCase()) ||
        (i.photographer ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (i.alt ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : items

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search stock: technology, africa, photographer name…"
        className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(i => (
          <button
            key={i.id}
            type="button"
            onClick={() => onPick({
              type: 'image',
              url: `/stock/${i.filename}`,
              alt: i.alt,
              attribution: {
                photographer: i.photographer ?? undefined,
                source: i.source,
                source_url: i.source_url ?? undefined,
              },
            })}
            className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand/50 transition-colors text-left"
          >
            <Image src={`/stock/${i.filename}`} alt={i.alt} fill sizes="240px" className="object-cover" unoptimized />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-[10px] truncate">{i.query}</p>
              {i.photographer && <p className="text-white/70 text-[9px] truncate">© {i.photographer}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
