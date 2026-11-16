'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { AppearanceSettings } from '@/components/appearance/AppearanceSettings'
import type { PublicSearchResult } from '@/lib/data/public-search'

export function ReaderTools() {
  const searchDialog = useRef<HTMLDialogElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicSearchResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  )
  const pathname = usePathname()

  useEffect(() => {
    searchDialog.current?.close()
  }, [pathname])
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && searchDialog.current?.open) {
        event.preventDefault()
        event.stopPropagation()
        searchDialog.current?.close()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchDialog.current?.showModal()
        searchInput.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [])
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setStatus('idle')
      return
    }
    const controller = new AbortController()
    setStatus('loading')
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error('Search unavailable')
        const data = await response.json()
        if (!controller.signal.aborted) {
          setResults(data.results)
          setStatus('ready')
        }
      } catch {
        if (!controller.signal.aborted) setStatus('error')
      }
    }, 220)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  return (
    <>
      <button
        ref={searchButton}
        type="button"
        className="personal-search-trigger"
        aria-label="Search this site"
        onClick={() => {
          searchDialog.current?.showModal()
          searchInput.current?.focus()
        }}
      >
        <Search size={17} />
        <span>Search</span>
        <kbd>⌘ K</kbd>
      </button>
      <AppearanceSettings />
      <dialog
        ref={searchDialog}
        className="personal-dialog personal-search-dialog"
        aria-labelledby="site-search-title"
        onClose={() => searchButton.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            searchDialog.current?.close()
        }}
      >
        <div className="personal-dialog-heading">
          <h2 id="site-search-title">Explore the archive</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => searchDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <form action="/search" method="get" className="personal-search-form">
          <label htmlFor="site-search-input" className="sr-only">
            Search biography, work, and writing
          </label>
          <Search size={20} />
          <input
            ref={searchInput}
            id="site-search-input"
            name="q"
            type="search"
            maxLength={120}
            placeholder="Biography, projects, ideas…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div
          className="personal-search-results"
          aria-live="polite"
          aria-busy={status === 'loading'}
        >
          {status === 'idle' && (
            <>
              <p className="personal-search-help">
                Search my biography, work, and writing. Start with a name,
                topic, or place.
              </p>
              <div className="personal-search-shortcuts">
                {[
                  { label: 'My story', href: '/about' },
                  { label: 'Work & ventures', href: '/projects' },
                  { label: 'Writing', href: '/blog' },
                  { label: 'Photographs', href: '/gallery' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => searchDialog.current?.close()}
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </>
          )}
          {status === 'loading' && (
            <p className="personal-search-help">Searching…</p>
          )}
          {status === 'error' && (
            <p className="personal-search-help">
              Search is unavailable right now. Please try again shortly.
            </p>
          )}
          {status === 'ready' && results.length === 0 && (
            <p className="personal-search-help">
              No results for “{query}”. Try another name or topic.
            </p>
          )}
          {status === 'ready' &&
            results.map((result, index) => (
              <Link
                className="personal-search-result"
                key={`${result.href}-${index}`}
                href={result.href}
                onClick={() => searchDialog.current?.close()}
              >
                <span>{result.kind}</span>
                <h3>{result.title}</h3>
                <p>{result.excerpt}</p>
              </Link>
            ))}
        </div>
        <div className="personal-dialog-foot">
          <span>Search the public archive</span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </dialog>
    </>
  )
}
