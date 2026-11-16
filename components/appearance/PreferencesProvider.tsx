'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  PREFERENCE_KEY,
  readAppearance,
  type ReaderSize,
  type ReaderWidth,
} from '@/lib/domain/appearance'
export type { ReaderSize, ReaderWidth } from '@/lib/domain/appearance'
const Preferences = createContext<{
  size: ReaderSize
  width: ReaderWidth
  loaded: boolean
  setSize: (value: ReaderSize) => void
  setWidth: (value: ReaderWidth) => void
} | null>(null)
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [size, setSize] = useState<ReaderSize>('standard')
  const [width, setWidth] = useState<ReaderWidth>('standard')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    function restore() {
      try {
        const saved = readAppearance(localStorage.getItem(PREFERENCE_KEY))
        setSize(saved.size)
        setWidth(saved.width)
      } catch {
        setSize('standard')
        setWidth('standard')
      }
    }
    function changed(event: StorageEvent) {
      if (event.key === PREFERENCE_KEY) restore()
    }
    restore()
    setLoaded(true)
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [])
  useEffect(() => {
    if (!loaded) return
    document.documentElement.dataset.readingSize = size
    document.documentElement.dataset.readingWidth = width
    try {
      const value = JSON.stringify({ size, width })
      if (localStorage.getItem(PREFERENCE_KEY) !== value)
        localStorage.setItem(PREFERENCE_KEY, value)
    } catch {
      /* Preferences still apply for this visit. */
    }
  }, [loaded, size, width])
  return (
    <Preferences.Provider value={{ size, width, loaded, setSize, setWidth }}>
      {children}
    </Preferences.Provider>
  )
}
export function usePreferences() {
  const value = useContext(Preferences)
  if (!value) throw Error('Appearance controls require PreferencesProvider')
  return value
}
