'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Layers,
  PenLine,
  Mail,
  MessageSquare,
  Users,
  Palette,
  Plug,
  User,
  LogOut,
  Megaphone,
  Quote,
  Briefcase,
  X,
  Newspaper,
  Settings,
  Image,
  BarChart3,
  ExternalLink,
  ChevronDown,
  Navigation,
  Search,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { BrandMark } from '@/components/personal/BrandMark'

type Item = {
  label: string
  href: string
  icon: React.ElementType
  exact?: boolean
}
const archive: Item[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Pages & biography', href: '/admin/content', icon: PenLine },
  { label: 'Writing', href: '/admin/blog', icon: FileText },
  { label: 'Work & ventures', href: '/admin/projects', icon: Layers },
  { label: 'Photographs', href: '/admin/gallery', icon: Image },
  { label: 'Media library', href: '/admin/media', icon: FolderOpen },
  { label: 'Mentions', href: '/admin/press', icon: Newspaper },
]
const audience: Item[] = [
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Site activity', href: '/admin/analytics', icon: BarChart3 },
]
const website: Item[] = [
  { label: 'Capabilities', href: '/admin/services', icon: Briefcase },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
  { label: 'Clients & partners', href: '/admin/clients', icon: Users },
  { label: 'Banners', href: '/admin/banners', icon: Megaphone },
  { label: 'Email delivery', href: '/admin/email-logs', icon: Mail },
]
const settings: Item[] = [
  { label: 'Site details', href: '/admin/settings/site', icon: Settings },
  { label: 'Appearance', href: '/admin/settings/appearance', icon: Palette },
  { label: 'Navigation', href: '/admin/settings/navigation', icon: Navigation },
  { label: 'Search & SEO', href: '/admin/settings/seo', icon: Search },
  { label: 'Integrations', href: '/admin/settings/integrations', icon: Plug },
  { label: 'My profile', href: '/admin/account/profile', icon: User },
  { label: 'Security', href: '/admin/account/security', icon: Shield },
]

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  email,
  collapsed = false,
  onToggleCollapsed,
}: {
  mobileOpen?: boolean
  onCloseMobile?: () => void
  email: string
  collapsed?: boolean
  onToggleCollapsed?: () => void
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
  const active = (item: Item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')
  function links(items: Item[]) {
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
          <div className="admin-nav-section">
            <p>Your archive</p>
            {links(archive)}
          </div>
          <div className="admin-nav-section">
            <p>Conversations & activity</p>
            {links(audience)}
          </div>
          <details
            className="admin-nav-section"
            open={collapsed || website.some(active)}
          >
            <summary>
              Website tools
              <ChevronDown size={14} />
            </summary>
            {links(website)}
          </details>
          <details
            className="admin-nav-section"
            open={collapsed || settings.some(active)}
          >
            <summary>
              Settings & account
              <ChevronDown size={14} />
            </summary>
            {links(settings)}
          </details>
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
          <div className="admin-account">
            <span className="admin-avatar">{email[0]?.toUpperCase()}</span>
            <Link href="/admin/account/profile" onClick={onCloseMobile}>
              <strong>Your workspace</strong>
              <small>{email}</small>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
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
