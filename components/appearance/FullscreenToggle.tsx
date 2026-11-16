'use client'
import { useEffect, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'
type FullDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => Promise<void> | void
}
type FullElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}
export function FullscreenToggle() {
  const [supported, setSupported] = useState(false)
  const [full, setFull] = useState(false)
  useEffect(() => {
    const doc = document as FullDocument
    const root = document.documentElement as FullElement
    setSupported(
      Boolean(
        (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) &&
        (root.requestFullscreen || root.webkitRequestFullscreen)
      )
    )
    function changed() {
      setFull(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement))
    }
    changed()
    document.addEventListener('fullscreenchange', changed)
    document.addEventListener('webkitfullscreenchange', changed)
    return () => {
      document.removeEventListener('fullscreenchange', changed)
      document.removeEventListener('webkitfullscreenchange', changed)
    }
  }, [])
  if (!supported) return null
  function toggle() {
    const doc = document as FullDocument
    const root = document.documentElement as FullElement
    try {
      const result =
        doc.fullscreenElement || doc.webkitFullscreenElement
          ? (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)
          : (root.requestFullscreen || root.webkitRequestFullscreen)?.call(root)
      Promise.resolve(result).catch(() => {
        /* Browser can refuse fullscreen. */
      })
    } catch {
      /* Keep current browser mode. */
    }
  }
  return (
    <button
      type="button"
      className="admin-fullscreen"
      onClick={toggle}
      aria-label={full ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={full ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {full ? <Minimize size={16} /> : <Maximize size={16} />}
    </button>
  )
}
