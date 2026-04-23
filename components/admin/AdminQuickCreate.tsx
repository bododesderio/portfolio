'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Quote, Image as ImageIcon, Upload } from 'lucide-react'

const actions = [
  { label: 'New Post',        icon: FileText,  href: '/admin/blog/new' },
  { label: 'New Testimonial', icon: Quote,     href: '/admin/testimonials?new=1' },
  { label: 'Gallery Item',    icon: ImageIcon, href: '/admin/gallery?new=1' },
  { label: 'Upload Media',    icon: Upload,    href: '/admin/media?upload=1' },
]

export function AdminQuickCreate() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-600 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-hairline bg-card shadow-xl py-1.5 z-50"
        >
          {actions.map(a => {
            const Icon = a.icon
            return (
              <Link
                key={a.href}
                href={a.href}
                role="menuitem"
                onClick={() => { setOpen(false); router.push(a.href) }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 text-fg-muted" />
                {a.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
