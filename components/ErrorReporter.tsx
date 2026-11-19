'use client'

import { useEffect } from 'react'

const MAX_REPORTS_PER_PAGE = 5
const sent = new Set<string>()

export function reportClientError(message: string, stack?: string) {
  const key = `${message}\n${stack?.split('\n')[1] ?? ''}`
  if (sent.has(key) || sent.size >= MAX_REPORTS_PER_PAGE) return
  sent.add(key)
  const payload = JSON.stringify({
    message: message.slice(0, 1000),
    stack: stack?.slice(0, 8000),
    path: window.location.pathname,
  })
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch((error: unknown) => {
    // The page already failed once; a failed report must not throw a second time.
    console.warn('[errors] report not sent', error)
  })
}

/** Sends uncaught browser errors and rejected promises to the admin's error list. */
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError(event.message || 'Uncaught error', event.error?.stack)
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      if (reason instanceof Error) reportClientError(reason.message, reason.stack)
      else reportClientError(`Unhandled rejection: ${String(reason).slice(0, 300)}`)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}
