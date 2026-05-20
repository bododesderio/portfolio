import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { FloatingButtons } from '@/components/ui/FloatingButtons'
import { BannerRenderer } from '@/components/ui/BannerRenderer'
import { getSiteSetting } from '@/lib/content'

type NavLink = { label: string; href: string; visible: boolean }

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/', visible: true },
  { label: 'About', href: '/about', visible: true },
  { label: 'Services', href: '/services', visible: true },
  { label: 'Projects', href: '/projects', visible: true },
  { label: 'Gallery', href: '/gallery', visible: true },
  { label: 'Blog', href: '/blog', visible: true },
  { label: 'Contact', href: '/contact', visible: true },
]

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [analyticsEnabled, navLinksRaw] = await Promise.all([
    getSiteSetting('admin.analytics_enabled').then(v => v !== 'false'),
    getSiteSetting('nav.links'),
  ])

  let navLinks: NavLink[] = DEFAULT_NAV_LINKS
  if (navLinksRaw) {
    try {
      navLinks = JSON.parse(navLinksRaw) as NavLink[]
    } catch {
      // fall back to defaults
    }
  }

  // Only pass visible links to the public site
  const visibleLinks = navLinks.filter(l => l.visible)

  return (
    <>
      <link rel="alternate" type="application/rss+xml" title="Bodo Desderio — Blog" href="/feed.xml" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-full focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>
      <Header navLinks={visibleLinks} />
      <main id="main-content" className="min-h-screen pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer navLinks={visibleLinks} />
      <FloatingButtons />
      <BannerRenderer />
      {analyticsEnabled && <PageViewTracker />}
    </>
  )
}
