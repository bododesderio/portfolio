import Link from 'next/link'
import { getSiteSettings } from '@/lib/data/content'
import { profileLinks } from '@/lib/domain/profile'
import { BrandMark } from '@/components/personal/BrandMark'
import { ProfileIcon } from '@/components/personal/ProfileIcon'

export default async function Footer({
  navLinks = [],
}: { navLinks?: Array<{ label: string; href: string }> } = {}) {
  const settings = await getSiteSettings()
  const links = profileLinks(settings)
  const social = links.filter((link) => link.kind === 'social')
  const writing = links.filter((link) => link.kind === 'writing')
  const pages = [
    ...navLinks.filter((link) => link.href !== '/'),
    { label: 'Capabilities', href: '/services' },
    { label: 'Search', href: '/search' },
    { label: 'RSS', href: '/feed.xml' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ].filter((link, index, all) => all.findIndex((other) => other.href === link.href) === index)

  return (
    <footer className="personal-footer">
      <div className="personal-wrap personal-footer-inner">
        <div className="personal-footer-identity">
          <Link href="/" className="personal-footer-name">
            <BrandMark className="personal-brand-mark" />
            Bodo Desderio
          </Link>
          <p>Software engineer and SEO specialist.</p>
        </div>

        {social.length > 0 && (
          <nav aria-label="Social profiles" className="personal-footer-social">
            {social.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label}, opens in a new tab`}
                title={link.label}
              >
                <ProfileIcon label={link.label} />
              </a>
            ))}
          </nav>
        )}

        {writing.length > 0 && (
          <nav aria-label="Code and writing elsewhere" className="personal-footer-writing">
            <span>Code and writing on</span>
            {writing.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                <ProfileIcon label={link.label} size={14} />
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <nav aria-label="Footer" className="personal-footer-pages">
          {pages.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="personal-footer-bottom">
          <p>© {new Date().getFullYear()} Bodo Desderio. All rights reserved.</p>
          <p>
            Designed and powered by{' '}
            <a href="https://rooibok.tech" target="_blank" rel="noopener noreferrer">
              Rooibok Technologies Limited
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
