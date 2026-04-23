'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Upload, Trash2 } from 'lucide-react'

export function LoginBackgroundCard({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/appearance/login-background', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUrl(data.url)
      toast.success(data.warnLowRes ? 'Uploaded — but image is below 1920×1080.' : 'Login background updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function reset() {
    if (!confirm('Reset to the default gradient background?')) return
    const res = await fetch('/api/admin/appearance/login-background', { method: 'DELETE' })
    if (res.ok) {
      setUrl('')
      toast.success('Reset.')
    } else {
      toast.error('Reset failed.')
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-serif text-lg text-fg">Admin login background</h2>
          <p className="text-sm text-fg-muted mt-1">JPEG, PNG, or WebP · max 5MB · recommended ≥ 1920×1080 · converted to WebP on upload.</p>
        </div>
        {url && (
          <button
            type="button"
            onClick={reset}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-fg-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="relative aspect-[16/9] max-w-2xl rounded-xl overflow-hidden border border-hairline bg-muted">
        {url ? (
          <Image src={url} alt="Current login background" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-fg-muted text-sm">
            No custom background — using the default gradient.
          </div>
        )}
      </div>

      <label
        htmlFor="login-bg-upload"
        className={`mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          uploading ? 'bg-muted text-fg-muted pointer-events-none' : 'bg-brand text-white hover:bg-brand-600'
        }`}
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading…' : url ? 'Replace background' : 'Upload background'}
        <input
          id="login-bg-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </label>
    </div>
  )
}
