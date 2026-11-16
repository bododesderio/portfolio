'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/personal/BrandMark'
import { ReaderTools } from '@/components/personal/ReaderTools'
type NavLink = { label: string; href: string }
const defaults: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/projects' },
  { label: 'Writing', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]
export function Header({ navLinks = defaults }: { navLinks?: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const toggle = useRef<HTMLButtonElement>(null)
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
    <header className="personal-header">
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
