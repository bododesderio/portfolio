'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface CustomSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  label?: string
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  required,
  label,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusIdx >= 0 && listRef.current) {
      const item = listRef.current.children[focusIdx] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusIdx, open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setFocusIdx(value ? options.indexOf(value) : 0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusIdx(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusIdx(i => Math.max(i - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusIdx >= 0) {
          onChange(options[focusIdx])
          setOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-fg-muted mb-2">{label}</label>
      )}

      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          value={value}
          required
          onChange={() => {}}
          onFocus={() => ref.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus()}
        />
      )}

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen(o => !o)
          if (!open) setFocusIdx(value ? options.indexOf(value) : 0)
        }}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between gap-2
          px-4 py-3 bg-card border border-hairline rounded-xl
          text-left transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40
          ${open ? 'ring-2 ring-brand border-brand/40' : ''}
          ${value ? 'text-fg' : 'text-fg-muted/50'}
        `}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 text-fg-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="
            absolute z-50 mt-2 w-full
            bg-card border border-hairline rounded-xl
            shadow-2xl shadow-black/20
            py-1.5 max-h-64 overflow-auto
            animate-in fade-in slide-in-from-top-2 duration-150
          "
        >
          {options.map((opt, i) => {
            const selected = opt === value
            const focused = i === focusIdx
            return (
              <li
                key={opt}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                onMouseEnter={() => setFocusIdx(i)}
                className={`
                  flex items-center justify-between gap-2
                  px-4 py-2.5 cursor-pointer text-sm
                  transition-colors duration-100
                  ${focused ? 'bg-brand/10 text-brand' : 'text-fg hover:bg-muted/50'}
                  ${selected ? 'font-medium' : ''}
                `}
              >
                <span>{opt}</span>
                {selected && <Check className="h-4 w-4 text-brand flex-shrink-0" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
