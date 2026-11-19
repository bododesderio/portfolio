'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  ExternalLink,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { BrandMark } from '@/components/personal/BrandMark'
import {
  ADMIN_NAV,
  isNavItemActive,
  type AdminBadge,
  type AdminNavItem,
} from '@/lib/admin-nav'

export type AdminBadgeCounts = Partial<Record<AdminBadge, number>>

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapsed,
  badges = {},
}: {
  mobileOpen?: boolean
  onCloseMobile?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  badges?: AdminBadgeCounts
}) {
  const pathname = usePathname()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (mobileOpen && !dialog.current?.open) dialog.current?.showModal()
    if (!mobileOpen && dialog.current?.open) dialog.current.close()
  }, [mobileOpen])
  useEffect(() => {
    const media = matchMedia('(min-width: 1024px)')
    function closeOnDesktop() {
      if (media.matches) onCloseMobile?.()
    }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [onCloseMobile])
  const active = (item: AdminNavItem) => isNavItemActive(item, pathname)
  function links(items: AdminNavItem[]) {
    return (
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={active(item) ? 'page' : undefined}
            >
              <item.icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && (badges[item.badge] ?? 0) > 0 && (
                <span
                  className="admin-nav-badge"
                  aria-label={`${badges[item.badge]} new`}
                >
                  {(badges[item.badge] ?? 0) > 99 ? '99+' : badges[item.badge]}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    )
  }
  function contents(mobile = false) {
    return (
      <>
        <div className="admin-sidebar-brand">
          <Link href="/admin" onClick={onCloseMobile}>
            <BrandMark />
            <span>
              Bodo Desderio<small>Personal archive · Studio</small>
            </span>
          </Link>
          {!mobile && (
            <button
              type="button"
              className="admin-sidebar-toggle"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={onToggleCollapsed}
            >
              {collapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
          )}
          {mobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <nav
          aria-label={mobile ? 'Mobile administration' : 'Administration'}
          className="admin-sidebar-nav"
        >
          {ADMIN_NAV.map((group) =>
            group.collapsible ? (
              <details
                key={group.label}
                className="admin-nav-section"
                open={collapsed || group.items.some(active)}
              >
                <summary>
                  {group.label}
                  <ChevronDown size={14} />
                </summary>
                {links(group.items)}
              </details>
            ) : (
              <div key={group.label} className="admin-nav-section">
                <p>{group.label}</p>
                {links(group.items)}
              </div>
            )
          )}
        </nav>
        <div className="admin-sidebar-footer">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-view-site"
          >
            <span>View portfolio</span>
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </div>
      </>
    )
  }
  return (
    <>
      <a href="#admin-main" className="admin-skip">
        Skip to workspace
      </a>
      <aside className="admin-sidebar">{contents()}</aside>
      <dialog
        ref={dialog}
        className="admin-site admin-mobile-drawer"
        onClose={onCloseMobile}
        onCancel={onCloseMobile}
        onClick={(event) => {
          if (event.target === event.currentTarget) onCloseMobile?.()
        }}
        aria-label="Administration menu"
      >
        <div className="admin-drawer-content">{contents(true)}</div>
      </dialog>
    </>
  )
}
