'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-card border border-hairline rounded-2xl shadow-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-fg leading-relaxed">
              This site uses minimal cookies for authentication and theme preferences.
              No tracking or advertising cookies.{' '}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-sm text-fg-muted hover:text-fg rounded-full border border-hairline hover:border-fg-muted transition-colors"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="px-5 py-2 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-full transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
