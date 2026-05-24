'use client'

import { useEffect } from 'react'

/**
 * Loads the Axiom UI library client-side.
 * Patches window.alert/confirm/prompt, replaces native selects,
 * date pickers, file inputs, color pickers, tooltips, and context menus
 * with fully themed custom components.
 *
 * Skips admin pages for context menu to avoid interfering with admin workflows.
 * Add `data-axm-skip` or class `axm-skip` to any element to prevent upgrading.
 */
export function AxiomUI() {
  useEffect(() => {
    // Load once — the script auto-initializes and uses MutationObserver
    // to upgrade dynamically rendered elements
    if (typeof window !== 'undefined') {
      const axiomWindow = window as Window & { _axiomLoaded?: boolean }
      if (axiomWindow._axiomLoaded) return
      const script = document.createElement('script')
      script.src = '/js/axiom-ui.js'
      script.defer = true
      document.head.appendChild(script)
      axiomWindow._axiomLoaded = true
    }
  }, [])

  return null
}
