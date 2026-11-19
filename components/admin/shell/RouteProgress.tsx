'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * A thin bar along the top while the next admin page loads. The App Router has
 * no navigation events, so a click on an in-app link starts it and the URL
 * changing finishes it.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function start(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      setProgress(12)
      if (timer.current) clearInterval(timer.current)
      timer.current = setInterval(() => {
        setProgress((value) => (value === null ? null : Math.min(90, value + (90 - value) * 0.12)))
      }, 200)
    }
    document.addEventListener('click', start)
    return () => document.removeEventListener('click', start)
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setProgress((value) => (value === null ? null : 100))
    const hide = setTimeout(() => setProgress(null), 250)
    return () => clearTimeout(hide)
  }, [pathname, searchParams])

  if (progress === null) return null
  return (
    <div
      className="admin-route-progress"
      role="progressbar"
      aria-label="Loading page"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  )
}
