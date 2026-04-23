'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

function humanize(segment: string): string {
  const cleaned = segment.replace(/-/g, ' ')
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const adminIdx = segments.indexOf('admin')
  if (adminIdx === -1) return null

  const crumbs: Array<{ label: string; href: string | null }> = [
    { label: 'Admin', href: '/admin' },
  ]

  const trailing = segments.slice(adminIdx + 1)
  let pathAccumulator = '/admin'
  for (let i = 0; i < trailing.length; i++) {
    const seg = trailing[i]
    pathAccumulator += `/${seg}`
    const isLast = i === trailing.length - 1
    const isDynamicId = /^[a-z0-9]{20,}$/i.test(seg)
    crumbs.push({
      label: isDynamicId ? 'Edit' : humanize(seg),
      href: isLast ? null : pathAccumulator,
    })
  }

  if (crumbs.length === 1) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        {crumbs.map((crumb, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-brand transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink-900 dark:text-ink-200 font-medium" aria-current="page">
                {crumb.label}
              </span>
            )}
            {idx < crumbs.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
