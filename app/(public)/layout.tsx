import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { getSiteSetting } from '@/lib/content'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const analyticsEnabled = (await getSiteSetting('admin.analytics_enabled')) !== 'false'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-full focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="min-h-screen pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      {analyticsEnabled && <PageViewTracker />}
    </>
  )
}
