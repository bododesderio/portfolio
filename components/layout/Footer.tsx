import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaMedium } from 'react-icons/fa'
import { getPageContent, getSiteSettings, getField } from '@/lib/content'
import { NewsletterForm } from './NewsletterForm'

const quickLinks = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const elsewhereLinks = [
  { label: 'Rooibok Technologies', href: 'https://rooibok.com', external: true },
  { label: 'Kakebe Technologies', href: 'https://www.kakebe.tech', external: true },
  { label: 'Resume', href: '/docs/bodo-desderio-resume.pdf' },
  { label: 'Book a call', key: 'site.calendly_url' },
]

export default async function Footer() {
  const content = await getPageContent('global')
  const settings = await getSiteSettings()

  const aboutHeading = getField(content, 'footer.about_heading')
  const aboutText = getField(content, 'footer.about_text')
  const newsletterHeading = getField(content, 'footer.newsletter_heading')
  const newsletterText = getField(content, 'footer.newsletter_text')
  const copyrightTemplate = getField(content, 'footer.copyright')

  const year = new Date().getFullYear()
  const copyright = copyrightTemplate.replace('{year}', String(year))

  const socialLinks = [
    { icon: FaLinkedin, href: settings['social.linkedin'], label: 'LinkedIn' },
    { icon: FaGithub, href: settings['social.github'], label: 'GitHub' },
    { icon: FaTwitter, href: settings['social.twitter'], label: 'Twitter / X' },
    { icon: FaInstagram, href: settings['social.instagram'], label: 'Instagram' },
    { icon: FaFacebook, href: settings['social.facebook'], label: 'Facebook' },
    { icon: FaMedium, href: settings['social.medium'], label: 'Medium' },
  ].filter(s => s.href)

  const email = settings['site.email'] || ''
  const location = settings['site.location'] || ''

  return (
    <footer className="relative bg-ink-900 text-ink-300 overflow-hidden">
      {/* Background ornament */}
      <div aria-hidden className="absolute inset-0 bg-radial-brand opacity-20" />
      <div aria-hidden className="absolute inset-0 bg-grid-dark bg-grid-md opacity-[0.12] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent_70%)]" />

      {/* Newsletter band */}
      <div className="relative border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-6">
              <p className="text-[11px] uppercase tracking-brand text-brand-300 mb-3">Newsletter</p>
              <h2 className="font-serif text-3xl md:text-5xl text-white leading-[1.05] tracking-tight">
                {newsletterHeading}
              </h2>
              <p className="mt-4 text-ink-300 max-w-md">{newsletterText}</p>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <NewsletterForm />
              <p className="mt-3 text-xs text-ink-400">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Link rows */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="h-2 w-2 rounded-full bg-brand shadow-glow-sm transition-transform duration-500 group-hover:scale-150" />
              <span className="font-serif text-lg text-white">Bodo Desderio</span>
            </Link>
            <p className="mt-6 text-ink-300 leading-relaxed max-w-sm">
              {aboutText || aboutHeading}
            </p>
            <div className="mt-8 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-brand hover:bg-brand/10 transition-all"
                >
                  <Icon className="h-4 w-4 text-ink-300 group-hover:text-brand transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Sitemap + Elsewhere — two columns on mobile, stacked as col-span-3 on md+ */}
          <div className="md:col-span-3 md:col-start-7 grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-0">
            <div>
              <p className="text-[10px] uppercase tracking-brand text-ink-400 mb-5">Sitemap</p>
              <ul className="space-y-2.5">
                {quickLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-ink-200 hover:text-brand transition-colors inline-flex items-center group"
                    >
                      <span>{link.label}</span>
                      <span className="ml-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:hidden">
              <p className="text-[10px] uppercase tracking-brand text-ink-400 mb-5">Elsewhere</p>
              <ul className="space-y-2.5">
                {elsewhereLinks.map(item => {
                  const href = item.key ? settings[item.key] : item.href
                  if (!href) return null
                  return (
                    <li key={item.label}>
                      <a
                        href={href}
                        target={item.external || item.key ? '_blank' : undefined}
                        rel={item.external || item.key ? 'noopener noreferrer' : undefined}
                        className="text-[15px] text-ink-200 hover:text-brand transition-colors inline-flex items-center group"
                      >
                        <span>{item.label}</span>
                        <span className="ml-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand">↗</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Elsewhere — md+ column, hidden on mobile (shown inside Sitemap grid above) */}
          <div className="hidden md:block md:col-span-3">
            <p className="text-[10px] uppercase tracking-brand text-ink-400 mb-5">Elsewhere</p>
            <ul className="space-y-2.5">
              {elsewhereLinks.map(item => {
                const href = item.key ? settings[item.key] : item.href
                if (!href) return null
                return (
                  <li key={item.label}>
                    <a
                      href={href}
                      target={item.external || item.key ? '_blank' : undefined}
                      rel={item.external || item.key ? 'noopener noreferrer' : undefined}
                      className="text-[15px] text-ink-200 hover:text-brand transition-colors inline-flex items-center group"
                    >
                      <span>{item.label}</span>
                      <span className="ml-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand">↗</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Contact line */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-ink-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`mailto:${email}`} className="hover:text-brand transition-colors">{email}</a>
            <span className="opacity-40">•</span>
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-brand transition-colors">Start a conversation →</Link>
          </div>
        </div>
      </div>

      {/* Wordmark / copyright row */}
      <div className="relative border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center md:justify-between gap-3">
          <p className="text-[11px] text-ink-400 tracking-wide">{copyright}</p>
          <p className="text-[11px] text-ink-400 font-mono">
            Built by{' '}
            <a
              href="https://rooibok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-200 hover:text-brand transition-colors underline decoration-dotted underline-offset-4"
            >
              Rooibok Technologies Limited
            </a>
          </p>
        </div>
        {/* Oversized wordmark */}
        <div aria-hidden className="pointer-events-none relative overflow-hidden h-32 md:h-44 -mt-2">
          <div className="absolute inset-x-0 -top-6 text-center font-serif text-[22vw] leading-none text-white/[0.04] tracking-tight select-none">
            BODO
          </div>
        </div>
      </div>
    </footer>
  )
}
