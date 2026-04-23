'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const SESSION_KEY = 'bodo_pv_session'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip admin paths.
    if (!pathname || pathname.startsWith('/admin')) return
    // Honour DNT — navigator.doNotTrack returns "1" / "0" / "unspecified" / "yes" / null.
    const dnt = typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1')
    if (dnt) return

    const sessionId = getOrCreateSessionId()
    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      sessionId,
    }

    const data = JSON.stringify(payload)
    const blob = new Blob([data], { type: 'application/json' })

    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/pv', blob)
    } else {
      fetch('/api/pv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {})
    }
  }, [pathname])

  return null
}
