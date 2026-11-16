'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'

type Result = {
  type: 'post' | 'project' | 'media' | 'message' | 'subscriber' | 'client'
  id: string
  title: string
  href: string
  subtitle?: string
}

const TYPE_LABEL: Record<Result['type'], string> = {
  post: 'Post',
  project: 'Work',
  media: 'Media',
  message: 'Message',
  subscriber: 'Subscriber',
  client: 'Client',
}

const TYPE_BADGE_BG: Record<Result['type'], string> = {
  post: 'bg-muted text-fg-muted',
  project: 'bg-muted text-fg-muted',
  media: 'bg-muted text-fg-muted',
  message: 'bg-muted text-fg-muted',
  subscriber: 'bg-muted text-fg-muted',
  client: 'bg-muted text-fg-muted',
}

export function AdminSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Cmd/Ctrl + K focuses input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  // Debounced fetch
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null)
      setLoading(false)
      setFailed(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setFailed(false)
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(q.trim())}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error()
        const data = (await res.json()) as Result[]
        if (!controller.signal.aborted) setResults(data)
      } catch {
        if (!controller.signal.aborted) {
          setResults(null)
          setFailed(true)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(handle)
      controller.abort()
    }
  }, [q])

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          maxLength={120}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => q && setOpen(true)}
          placeholder="Search your workspace…"
          className="w-full pl-10 pr-14 py-2 bg-muted border border-hairline rounded-xl text-sm text-fg placeholder-fg-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40"
          aria-label="Admin search"
        />
        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded border border-hairline bg-surface-2 text-[10px] text-fg-muted font-mono">
          ⌘K
        </kbd>
      </div>

      {open && q && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-hairline bg-card shadow-xl max-h-[60vh] overflow-y-auto z-50">
          {loading && (
            <div className="flex items-center justify-center p-8 text-fg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!loading && failed && (
            <p className="p-6 text-center text-sm text-fg-muted" role="status">
              Search is unavailable. Please try again.
            </p>
          )}
          {!loading && q.trim().length < 2 && (
            <p className="p-6 text-sm text-fg-muted">
              Type at least two characters to search.
            </p>
          )}
          {!loading && !failed && results !== null && results.length === 0 && (
            <p className="p-6 text-center text-sm text-fg-muted">
              No results for &ldquo;{q}&rdquo;.
            </p>
          )}
          {!loading && results && results.length > 0 && (
            <ul className="py-2">
              {results.map((r) => (
                <li key={`${r.type}:${r.id}`}>
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${TYPE_BADGE_BG[r.type]}`}
                    >
                      {TYPE_LABEL[r.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-fg truncate">{r.title}</p>
                      {r.subtitle && (
                        <p className="text-xs text-fg-muted truncate">
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
