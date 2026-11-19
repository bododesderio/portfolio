import Link from 'next/link'
import { getSiteSettings } from '@/lib/data/content'
import { safePublicHref } from '@/lib/domain/profile'
import { BrandMark } from '@/components/personal/BrandMark'
export default async function Footer({
  navLinks = [],
}: { navLinks?: Array<{ label: string; href: string }> } = {}) {
  const settings = await getSiteSettings()
  const socials = [
    { label: 'LinkedIn', key: 'social.linkedin' },
    { label: 'GitHub', key: 'social.github' },
    { label: 'Medium', key: 'social.medium' },
  ].flatMap((item) => {
    const href = safePublicHref(settings[item.key] || '')
    return href ? [{ ...item, href }] : []
  })
  return (
    <footer className="personal-footer personal-wrap">
      <div className="personal-footer-top">
        <div className="personal-footer-identity">
          <BrandMark className="personal-brand-mark" />
          <div>
            <Link href="/" className="personal-footer-name">
              Bodo Desderio
            </Link>
            <p>A record of my life, work, and things I care about.</p>
          </div>
        </div>
        <nav aria-label="Footer">
          {socials.map((item) => (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label} ↗
            </a>
          ))}
          <Link href="/contact">Say hello →</Link>
        </nav>
      </div>
      <div className="personal-footer-bottom">
        <p>
          © {new Date().getFullYear()} Bodo Desderio
          <span>{settings['site.location'] || 'Kampala, Uganda'}</span>
        </p>
        <nav aria-label="Site information">
          <Link href="/services">Capabilities</Link>
          {navLinks
            .filter(
              (link) =>
                ![
                  '/',
                  '/about',
                  '/projects',
                  '/blog',
                  '/contact',
                  '/gallery',
                  '/services',
                ].includes(link.href)
            )
            .map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          <Link href="/search">Search</Link>
          <Link href="/feed.xml">RSS</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
