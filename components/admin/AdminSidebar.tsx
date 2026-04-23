'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BarChart3, FileText, FolderOpen,
  PenLine, Mail, MessageSquare, Users, Palette, Plug,
  User, LogOut, ChevronRight,
  Quote, Briefcase, X as XIcon, Newspaper, Settings as SettingsIcon,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: React.ElementType; exact?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blog Posts',    href: '/admin/blog',         icon: FileText },
      { label: 'Pages',         href: '/admin/content',      icon: PenLine },
      { label: 'Press',         href: '/admin/press',        icon: Newspaper },
      { label: 'Media Library', href: '/admin/media',        icon: FolderOpen },
      { label: 'Services',      href: '/admin/services',     icon: Briefcase },
      { label: 'Testimonials',  href: '/admin/testimonials', icon: Quote },
    ],
  },
  {
    label: 'Audience',
    items: [
      { label: 'Subscribers', href: '/admin/newsletter', icon: Mail },
      { label: 'Messages',    href: '/admin/messages',   icon: MessageSquare },
      { label: 'Clients',     href: '/admin/clients',    icon: Users },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Appearance',    href: '/admin/settings/appearance',   icon: Palette },
      { label: 'Site & SEO',    href: '/admin/settings/site',         icon: SettingsIcon },
      { label: 'Integrations',  href: '/admin/settings/integrations', icon: Plug },
      { label: 'Account',       href: '/admin/settings/account',      icon: User },
    ],
  },
]

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  email,
}: {
  mobileOpen?: boolean
  onCloseMobile?: () => void
  email: string
}) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-40 flex h-screen w-64 flex-col bg-card border-r border-hairline transition-transform duration-300 ease-out-expo ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-hairline">
          <Link href="/admin" className="group inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand shadow-glow-sm" />
            <span className="font-serif text-base text-fg tracking-tight">Bodo Desderio</span>
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-fg-muted hover:bg-muted"
            aria-label="Close menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map(group => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-fg-muted/70">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon
                  const active = isActive(pathname, item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          active
                            ? 'bg-brand/10 text-brand'
                            : 'text-fg-muted hover:bg-muted hover:text-fg'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="h-3 w-3" aria-hidden />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-hairline p-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
            <Avatar email={email} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-fg truncate">Admin</p>
              <p className="text-[11px] text-fg-muted truncate">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
          <Link
            href="/"
            target="_blank"
            className="mt-2 block text-center text-[11px] text-fg-muted hover:text-brand transition-colors"
          >
            View site ↗
          </Link>
        </div>
      </aside>
    </>
  )
}

function Avatar({ email }: { email: string }) {
  const letter = (email || '?')[0]?.toUpperCase() ?? '?'
  return (
    <div className="relative h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-700 text-white flex items-center justify-center text-[12px] font-semibold">
      {letter}
    </div>
  )
}
