'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { ThemePreference } from '@/lib/auth'

/**
 * Applies the admin's server-stored theme preference on mount.
 * Only runs inside the admin group. Visitor routes never mount this.
 *
 * We only sync the server preference once (on initial mount) to avoid
 * overriding a preference the user just changed via the toggle — the
 * toggle already calls setTheme() which writes to localStorage immediately.
 */
export function AdminThemeApplier({ preference }: { preference: ThemePreference }) {
  const { setTheme } = useTheme()
  const applied = useRef(false)

  useEffect(() => {
    if (!applied.current) {
      applied.current = true
      setTheme(preference)
    }
  }, [preference, setTheme])

  return null
}
