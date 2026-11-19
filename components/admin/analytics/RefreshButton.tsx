'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function RefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      className="admin-secondary-button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw size={14} aria-hidden="true" className={pending ? 'admin-spin' : undefined} />
      {pending ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}
