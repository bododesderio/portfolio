'use client'

import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    // Block copy, cut, paste, selectall
    const onCopy = (e: ClipboardEvent) => e.preventDefault()
    const onCut = (e: ClipboardEvent) => e.preventDefault()

    // Block keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (
        // View source
        (ctrl && e.key === 'u') ||
        // Save page
        (ctrl && e.key === 's') ||
        // Save as
        (ctrl && e.shiftKey && e.key === 's') ||
        // DevTools
        (ctrl && e.shiftKey && e.key === 'i') ||
        (ctrl && e.shiftKey && e.key === 'j') ||
        (ctrl && e.shiftKey && e.key === 'c') ||
        e.key === 'F12'
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Block drag of images
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('dragstart', onDragStart)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [])

  return null
}
