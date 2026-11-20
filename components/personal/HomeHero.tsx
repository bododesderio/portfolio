import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { safePublicHref } from '@/lib/domain/profile'

/**
 * Full-screen opening for the home page on the dark green gradient. The
 * actions sit in their own grid area so phones can stack them under both the
 * copy and the head-and-shoulders crop of the portrait.
 */
export function HomeHero({
  name,
  role,
  tagline,
  photo,
  primary,
  secondary,
}: {
  name: string
  role: string
  tagline: string
  photo: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}) {
  const primaryHref = safePublicHref(primary.href) || '/contact'
  const secondaryHref = safePublicHref(secondary.href) || '/about'
  return (
    <section className="personal-hero" aria-labelledby="hero-title">
      <div className="personal-wrap personal-hero-inner">
        <div className="personal-hero-copy">
          <h1 id="hero-title">{name}</h1>
          <p className="personal-hero-role">{role}</p>
          {tagline && <p className="personal-hero-tagline">{tagline}</p>}
        </div>
        <div className="personal-hero-portrait">
          <Image
            src={photo}
            alt={`Portrait of ${name}`}
            fill
            priority
            sizes="(max-width: 760px) 90vw, 46vw"
            className="object-contain object-bottom"
          />
        </div>
        <div className="personal-hero-actions">
          <Link href={primaryHref} className="personal-hero-primary">
            {primary.label}
          </Link>
          <Link href={secondaryHref} className="personal-hero-secondary">
            {secondary.label}
          </Link>
        </div>
      </div>
      <a href="#introduction" className="personal-hero-next">
        <span>More about me</span>
        <ChevronDown size={18} aria-hidden="true" />
      </a>
    </section>
  )
}
