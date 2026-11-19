import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { safePublicHref } from '@/lib/domain/profile'

/**
 * Full-screen opening for the home page: copy on the left, the cut-out
 * portrait on the right, over a CMS hero photograph darkened for legibility.
 */
export function HomeHero({
  name,
  role,
  location,
  tagline,
  photo,
  background,
  primary,
  secondary,
}: {
  name: string
  role: string
  location: string
  tagline: string
  photo: string
  background: string | null
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}) {
  const primaryHref = safePublicHref(primary.href) || '/contact'
  const secondaryHref = safePublicHref(secondary.href) || '/about'
  return (
    <section className="personal-hero" aria-labelledby="hero-title">
      {background && (
        <Image
          src={background}
          alt=""
          fill
          priority
          sizes="100vw"
          className="personal-hero-backdrop object-cover"
        />
      )}
      <span className="personal-hero-shade" aria-hidden="true" />
      <div className="personal-wrap personal-hero-inner">
        <div className="personal-hero-copy">
          <p className="personal-hero-eyebrow">{location}</p>
          <h1 id="hero-title">{name}</h1>
          <p className="personal-hero-role">{role}</p>
          {tagline && <p className="personal-hero-tagline">{tagline}</p>}
          <div className="personal-hero-actions">
            <Link href={primaryHref} className="personal-hero-primary">
              {primary.label}
            </Link>
            <Link href={secondaryHref} className="personal-hero-secondary">
              {secondary.label}
            </Link>
          </div>
        </div>
        <div className="personal-hero-portrait">
          <Image
            src={photo}
            alt={`Portrait of ${name}`}
            fill
            priority
            sizes="(max-width: 760px) 60vw, 46vw"
            className="object-contain object-bottom"
          />
        </div>
      </div>
      <a href="#introduction" className="personal-hero-next">
        <span>More about me</span>
        <ChevronDown size={18} aria-hidden="true" />
      </a>
    </section>
  )
}
