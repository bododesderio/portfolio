'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { PublicSearchResult } from '@/lib/data/public-search'

type ReaderSize = 'small' | 'standard' | 'large'
type ReaderWidth = 'standard' | 'wide'
const STORAGE_KEY = 'bodo-reading-preferences'
export function ReaderTools() {
  const searchDialog = useRef<HTMLDialogElement>(null)
  const settingsDialog = useRef<HTMLDialogElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const settingsButton = useRef<HTMLButtonElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicSearchResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  )
  const [size, setSize] = useState<ReaderSize>('standard')
  const [width, setWidth] = useState<ReaderWidth>('standard')
  const [loaded, setLoaded] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      if (['small', 'standard', 'large'].includes(saved.size))
        setSize(saved.size)
      if (['standard', 'wide'].includes(saved.width)) setWidth(saved.width)
    } catch {
      /* Use readable defaults if storage is unavailable. */
    }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    document.documentElement.dataset.readingSize = size
    document.documentElement.dataset.readingWidth = width
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, width }))
    } catch {
      /* Preferences still work for this visit. */
    }
  }, [loaded, size, width])
  useEffect(() => {
    searchDialog.current?.close()
    settingsDialog.current?.close()
  }, [pathname])
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        (searchDialog.current?.open || settingsDialog.current?.open)
      ) {
        event.preventDefault()
        event.stopPropagation()
        searchDialog.current?.close()
        settingsDialog.current?.close()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        settingsDialog.current?.close()
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
      <button
        ref={settingsButton}
        type="button"
        className="personal-reader-trigger"
        aria-label="Reading settings"
        onClick={() => settingsDialog.current?.showModal()}
      >
        <SlidersHorizontal size={18} />
      </button>
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
      <dialog
        ref={settingsDialog}
        className="personal-dialog personal-settings-dialog"
        aria-labelledby="reader-settings-title"
        onClose={() => settingsButton.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            settingsDialog.current?.close()
        }}
      >
        <div className="personal-dialog-heading">
          <h2 id="reader-settings-title">Make yourself comfortable</h2>
          <button
            type="button"
            aria-label="Close reading settings"
            onClick={() => settingsDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p className="personal-settings-intro">
          A few ways to make this space feel more like yours.
        </p>
        <fieldset>
          <legend>Appearance</legend>
          <div className="personal-segmented">
            {['light', 'dark', 'system'].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={loaded && theme === value}
                onClick={() => setTheme(value)}
              >
                {value === 'system'
                  ? 'Automatic'
                  : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Text size</legend>
          <div className="personal-segmented">
            {(['small', 'standard', 'large'] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={size === value}
                onClick={() => setSize(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Reading width</legend>
          <div className="personal-segmented">
            {(['standard', 'wide'] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={width === value}
                onClick={() => setWidth(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="personal-dialog-foot">
          <button
            type="button"
            onClick={() => {
              setSize('standard')
              setWidth('standard')
              setTheme('system')
            }}
          >
            Reset preferences
          </button>
          <span>Saved on this device</span>
        </div>
      </dialog>
    </>
  )
}
