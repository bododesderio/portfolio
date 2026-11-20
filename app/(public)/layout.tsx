import { Lightbox } from '@/components/personal/Lightbox'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { BannerRenderer } from '@/components/ui/BannerRenderer'
import { getSiteSetting } from '@/lib/data/content'
import { readNavigation } from '@/lib/domain/profile'
import { HEADER_BEHAVIOR_KEY, readHeaderBehavior } from '@/lib/domain/header-behavior'
import './personal.css'

type NavLink = { label: string; href: string; visible: boolean }

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/', visible: true },
  { label: 'About', href: '/about', visible: true },
  { label: 'Work', href: '/projects', visible: true },
  { label: 'Gallery', href: '/gallery', visible: true },
  { label: 'Writing', href: '/blog', visible: true },
  { label: 'Contact', href: '/contact', visible: true },
]

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [analyticsEnabled, navLinksRaw, requestHeaders, headerBehavior] = await Promise.all([
    getSiteSetting('admin.analytics_enabled').then(v => v !== 'false'),
    getSiteSetting('nav.links'),
    headers(),
    getSiteSetting(HEADER_BEHAVIOR_KEY).then(readHeaderBehavior),
  ])
  const maintenancePreview = requestHeaders.get('x-maintenance-preview') === '1'

  const navLinks = readNavigation(navLinksRaw, DEFAULT_NAV_LINKS)

  // Only pass visible links to the public site
  const visibleLinks = navLinks.filter(l => l.visible)

  return (
    <div className="personal-site">
      <link rel="alternate" type="application/rss+xml" title="Bodo Desderio Blog" href="/feed.xml" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-full focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>
      {maintenancePreview && (
        <p className="personal-maintenance-notice" role="status">
          Maintenance mode is on. Visitors see the maintenance page; you are
          seeing the site because you are signed in.{' '}
          <Link href="/admin/system/maintenance">Turn it off</Link>
        </p>
      )}
      <Header navLinks={visibleLinks} behavior={headerBehavior} />
      <main id="main-content" className="personal-main">
        {children}
      </main>
      <Footer navLinks={visibleLinks} />
      <Lightbox />
      <BannerRenderer />
      {analyticsEnabled && <PageViewTracker />}
    </div>
  )
}
