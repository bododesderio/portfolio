'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/personal/BrandMark'
import { ReaderTools } from '@/components/personal/ReaderTools'
import type { HeaderBehavior } from '@/lib/domain/header-behavior'
type NavLink = { label: string; href: string }
const defaults: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/projects' },
  { label: 'Writing', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]
/** Scroll distance before the header may hide, and the movement that counts as a direction change. */
const HIDE_AFTER = 140
const JITTER = 8

export function Header({
  navLinks = defaults,
  behavior = 'hide',
}: {
  navLinks?: NavLink[]
  behavior?: HeaderBehavior
}) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const pathname = usePathname()
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  // Tapping a header link leaves focus on it, so focus alone cannot mean "in use";
  // only a keyboard user tabbing through the header keeps it pinned.
  const keyboardUser = useRef(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') keyboardUser.current = true
    }
    const onPointer = () => {
      keyboardUser.current = false
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])
  useEffect(() => {
    if (behavior !== 'hide') return
    let lastY = window.scrollY
    let frame = 0
    function update() {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < JITTER) return
      const busy = keyboardUser.current && (header.current?.contains(document.activeElement) ?? false)
      setHidden(delta > 0 && y > HIDE_AFTER && !busy)
      lastY = y
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [behavior])
  useEffect(() => setHidden(false), [pathname])
  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open])
  return (
    <header
      ref={header}
      className="personal-header"
      data-behavior={behavior}
      data-hidden={(hidden && !open) || undefined}
      onFocusCapture={() => {
        if (keyboardUser.current) setHidden(false)
      }}
    >
      <div className="personal-wrap personal-header-inner">
        <Link
          href="/"
          className="personal-wordmark"
          onClick={() => setOpen(false)}
        >
          <BrandMark className="personal-brand-mark" />
          <span>
            Bodo Desderio
            <span className="personal-wordmark-caption">
              A personal archive
            </span>
          </span>
        </Link>
        <div className="personal-header-controls">
          <ReaderTools />
          <button
            ref={toggle}
            type="button"
            className="personal-menu-toggle"
            aria-controls="personal-navigation"
            aria-expanded={open}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav
          id="personal-navigation"
          className={`personal-navigation ${open ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                (
                  link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href ||
                      pathname.startsWith(link.href + '/')
                )
                  ? 'page'
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
