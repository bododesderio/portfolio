'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import type { ThemePreference } from '@/lib/auth'

/**
 * Applies the admin's server-stored theme preference on mount.
 * Only runs inside the admin group. Visitor routes never mount this.
 */
export function AdminThemeApplier({ preference }: { preference: ThemePreference }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(preference)
  }, [preference, setTheme])

  return null
}
