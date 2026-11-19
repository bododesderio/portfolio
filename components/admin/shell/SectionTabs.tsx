'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeNavItem, activeTab } from '@/lib/admin-nav'

/** Tabs for sections that span several screens, such as Settings or System. */
export function SectionTabs() {
  const pathname = usePathname()
  const item = activeNavItem(pathname)
  if (!item?.tabs) return null
  const current = activeTab(item, pathname)
  return (
    <nav className="admin-section-tabs" aria-label={`${item.label} sections`}>
      {item.tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={current?.href === tab.href ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
