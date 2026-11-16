'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { SlidersHorizontal, X } from 'lucide-react'
import {
  usePreferences,
  type ReaderSize,
  type ReaderWidth,
} from './PreferencesProvider'
export function AppearanceSettings() {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const { size, width, loaded, setSize, setWidth } = usePreferences()
  const { theme, setTheme } = useTheme()
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (!dialog.current?.open) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        dialog.current.close()
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      )
        dialog.current.close()
    }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [])
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="appearance-trigger"
        aria-label="Reading settings"
        title="Appearance and reading settings"
        onClick={() => dialog.current?.showModal()}
      >
        <SlidersHorizontal size={17} />
      </button>
      <dialog
        ref={dialog}
        className="appearance-dialog"
        aria-labelledby="reader-settings-title"
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
      >
        <header>
          <div>
            <h2 id="reader-settings-title">Appearance & reading</h2>
            <p>One preference across your portfolio and studio.</p>
          </div>
          <button
            type="button"
            aria-label="Close reading settings"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </header>
        <fieldset>
          <legend>Theme</legend>
          <div className="appearance-options">
            {['light', 'dark', 'system'].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={loaded && theme === value}
                onClick={() => setTheme(value)}
              >
                {value === 'system'
                  ? 'Automatic'
                  : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Text size</legend>
          <div className="appearance-options">
            {(['small', 'standard', 'large'] as ReaderSize[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={size === value}
                onClick={() => setSize(value)}
              >
                {value === 'standard'
                  ? 'Default (14px)'
                  : value === 'small'
                    ? 'Small (12px)'
                    : 'Large (16px)'}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Content width</legend>
          <div className="appearance-options">
            {(['standard', 'wide'] as ReaderWidth[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={width === value}
                onClick={() => setWidth(value)}
              >
                {value === 'standard' ? 'Standard' : 'Wide'}
              </button>
            ))}
          </div>
        </fieldset>
        <footer>
          <button
            type="button"
            onClick={() => {
              setSize('standard')
              setWidth('standard')
              setTheme('system')
            }}
          >
            Reset preferences
          </button>
          <span>Saved on this browser</span>
        </footer>
      </dialog>
    </>
  )
}
