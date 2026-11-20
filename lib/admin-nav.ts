import {
  Bell,
  Briefcase,
  FileText,
  Image,
  Layers,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  PenLine,
  Quote,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'

export type AdminTab = { label: string; href: string }
export type AdminBadge = 'messages' | 'notifications' | 'errors'
export type AdminNavItem = {
  label: string
  href: string
  icon: React.ElementType
  /** Only the exact path is active (the overview would otherwise match every page). */
  exact?: boolean
  /** Extra path prefixes that belong to this item, such as an older URL for the same screen. */
  match?: string[]
  tabs?: AdminTab[]
  badge?: AdminBadge
}
export type AdminNavGroup = { label: string; items: AdminNavItem[]; collapsible?: boolean }

/** The single source for the sidebar, the section tabs and the breadcrumbs. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell, badge: 'notifications' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Pages & biography', href: '/admin/content', icon: PenLine },
      { label: 'Writing', href: '/admin/blog', icon: FileText },
      { label: 'Work & ventures', href: '/admin/projects', icon: Layers },
      {
        label: 'Photos & media',
        href: '/admin/gallery',
        icon: Image,
        match: ['/admin/media'],
        tabs: [
          { label: 'Gallery photos', href: '/admin/gallery' },
          { label: 'All uploaded files', href: '/admin/media' },
        ],
      },
      { label: 'Mentions', href: '/admin/press', icon: Newspaper },
    ],
  },
  {
    label: 'Audience',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare, badge: 'messages' },
      {
        label: 'Newsletter',
        href: '/admin/newsletter',
        icon: Mail,
        match: ['/admin/email-logs'],
        tabs: [
          { label: 'Campaigns', href: '/admin/newsletter' },
          { label: 'Email delivery', href: '/admin/email-logs' },
        ],
      },
    ],
  },
  {
    label: 'Website',
    collapsible: true,
    items: [
      { label: 'Capabilities', href: '/admin/services', icon: Briefcase },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
      { label: 'Clients & partners', href: '/admin/clients', icon: Users },
      { label: 'Banners', href: '/admin/banners', icon: Megaphone },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'System',
        href: '/admin/system/maintenance',
        icon: ShieldCheck,
        match: ['/admin/system'],
        badge: 'errors',
        tabs: [
          { label: 'Maintenance', href: '/admin/system/maintenance' },
          { label: 'Audit trail', href: '/admin/system/audit' },
          { label: 'Error reports', href: '/admin/system/errors' },
        ],
      },
      {
        label: 'Settings',
        href: '/admin/settings/site',
        icon: Settings,
        match: ['/admin/settings'],
        tabs: [
          { label: 'Site details', href: '/admin/settings/site' },
          { label: 'Appearance', href: '/admin/settings/appearance' },
          { label: 'Navigation', href: '/admin/settings/navigation' },
          { label: 'Search & SEO', href: '/admin/settings/seo' },
          { label: 'Integrations', href: '/admin/settings/integrations' },
        ],
      },
      {
        label: 'Account',
        href: '/admin/account/profile',
        icon: User,
        match: ['/admin/account'],
        tabs: [
          { label: 'Profile', href: '/admin/account/profile' },
          { label: 'Security', href: '/admin/account/security' },
          { label: 'Preferences', href: '/admin/account/preferences' },
        ],
      },
    ],
  },
]

const within = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

export function isNavItemActive(item: AdminNavItem, pathname: string) {
  if (item.exact) return pathname === item.href
  return [item.href, ...(item.match ?? [])].some((prefix) => within(pathname, prefix))
}

export function activeNavItem(pathname: string): AdminNavItem | null {
  for (const group of ADMIN_NAV)
    for (const item of group.items) if (isNavItemActive(item, pathname)) return item
  return null
}

export function activeTab(item: AdminNavItem, pathname: string): AdminTab | null {
  return item.tabs?.find((tab) => within(pathname, tab.href)) ?? null
}
