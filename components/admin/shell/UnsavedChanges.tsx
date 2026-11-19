'use client'

import { useCallback, useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from './ConfirmDialog'

const pending = new Set<string>()
const listeners = new Set<() => void>()
let version = 0

function changed() {
  version += 1
  for (const listener of listeners) listener()
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Marks the calling editor as holding unsaved work while `dirty` is true, so
 * leaving the page asks first. Call `clear()` right after a successful save.
 */
export function useUnsavedChanges(dirty: boolean) {
  const id = useId()
  useEffect(() => {
    if (dirty) pending.add(id)
    else pending.delete(id)
    changed()
    return () => {
      pending.delete(id)
      changed()
    }
  }, [dirty, id])
  const clear = useCallback(() => {
    pending.delete(id)
    changed()
  }, [id])
  return useMemo(() => ({ clear }), [clear])
}

function internalHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null
  const anchor = (event.target as Element | null)?.closest?.('a')
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return null
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null
  return url.pathname + url.search + url.hash
}

/** Mounted once in the admin shell: intercepts links and tab closes while any editor is dirty. */
export function UnsavedChangesHost() {
  const router = useRouter()
  const current = useSyncExternalStore(subscribe, () => version, () => 0)
  const [leavingTo, setLeavingTo] = useState<string | null>(null)

  useEffect(() => {
    if (pending.size === 0) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    // Capture phase, so this runs before Next's link handler and the progress bar.
    const onClick = (event: MouseEvent) => {
      const href = internalHref(event)
      if (!href) return
      event.preventDefault()
      event.stopPropagation()
      setLeavingTo(href)
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('click', onClick, true)
    }
  }, [current])

  return (
    <ConfirmDialog
      open={leavingTo !== null}
      title="Leave without saving?"
      body="You have changes on this page that are not saved yet. Leaving now discards them."
      confirmLabel="Discard changes"
      cancelLabel="Keep editing"
      tone="danger"
      onCancel={() => setLeavingTo(null)}
      onConfirm={() => {
        const destination = leavingTo
        pending.clear()
        changed()
        setLeavingTo(null)
        if (destination) router.push(destination)
      }}
    />
  )
}
