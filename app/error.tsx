'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportClientError } from '@/components/ErrorReporter'
import { BrandMark } from '@/components/personal/BrandMark'
import './maintenance/maintenance.css'

/** Shown when a page fails to render. Same calm screen as maintenance mode; the error goes to the admin. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error.message, error.digest ?? '')
    reportClientError(
      error.digest ? `${error.message} (digest ${error.digest})` : error.message,
      error.stack
    )
  }, [error])

  return (
    <main className="maintenance-page">
      <div className="maintenance-card">
        <BrandMark className="maintenance-mark" />
        <p className="maintenance-eyebrow">Bodo Desderio</p>
        <h1>This page is being worked on</h1>
        <p>
          Something on this page did not load properly. It has been reported and will be fixed shortly. Trying again usually
          works.
        </p>
        <div className="maintenance-actions">
          <button type="button" onClick={reset}>
            Try again
          </button>
          <Link href="/">Go to the home page</Link>
        </div>
      </div>
    </main>
  )
}
