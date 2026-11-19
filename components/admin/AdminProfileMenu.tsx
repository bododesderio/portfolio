'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  ChevronDown,
  ExternalLink,
  History,
  LogOut,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'

function initialsOf(name: string, email: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words.at(-1)![0]}`.toUpperCase()
  return (words[0]?.[0] ?? email[0] ?? 'A').toUpperCase()
}

const ITEMS = [
  { href: '/admin/account/profile', icon: UserRound, label: 'My profile', detail: 'Name, photo and email' },
  { href: '/admin/account/security', icon: ShieldCheck, label: 'Security', detail: 'Password and sign-in' },
  { href: '/admin/settings/site', icon: Settings, label: 'Settings', detail: 'Site details, SEO and integrations' },
  { href: '/admin/account/preferences', icon: SlidersHorizontal, label: 'Appearance', detail: 'Theme and reading size' },
  { href: '/admin/system/audit', icon: History, label: 'Activity', detail: 'Audit trail and error reports' },
]

/** Account button at the right of the top bar, laid out like the Goodname Finance portal's. */
export function AdminProfileMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="admin-profile" ref={root}>
      <button
        type="button"
        className="admin-profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="admin-profile-avatar" aria-hidden="true">
          {initialsOf(name, email)}
        </span>
        <ChevronDown size={14} aria-hidden="true" data-open={open || undefined} />
      </button>
      {open && (
        <div className="admin-profile-panel" role="menu" aria-label="Account">
          <div className="admin-profile-who">
            <strong>{name}</strong>
            <span>{email}</span>
            <small>Site owner · full access</small>
          </div>
          <div className="admin-profile-items">
            {ITEMS.map((item) => (
              <Link key={item.href} href={item.href} role="menuitem" onClick={() => setOpen(false)}>
                <item.icon size={16} aria-hidden="true" />
                <span>
                  {item.label}
                  <small>{item.detail}</small>
                </span>
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)}>
              <ExternalLink size={16} aria-hidden="true" />
              <span>
                View the website
                <small>Opens in a new tab</small>
              </span>
            </a>
          </div>
          <div className="admin-profile-signout">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                void signOut({ callbackUrl: '/admin/login' })
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
          <p className="admin-profile-note">
            <ShieldCheck size={13} aria-hidden="true" />
            Every sign-in is recorded in the audit trail.
          </p>
        </div>
      )}
    </div>
  )
}
