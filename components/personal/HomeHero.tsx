import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { safePublicHref } from '@/lib/domain/profile'
import { HeroSlides, type HeroSlide } from '@/components/personal/HeroSlides'

/**
 * Full-screen opening for the home page. At every width the portrait fills the
 * right side from top to bottom like a backdrop, and an overlay sits behind the
 * copy on the left so the photo itself stays uncovered. The portrait and the
 * active hero images rotate every few seconds.
 */
export function HomeHero({
  name,
  role,
  tagline,
  photo,
  backdrops = [],
  primary,
  secondary,
}: {
  name: string
  role: string
  tagline: string
  photo: string
  /** Active images from Content > Home > hero images, shown after the portrait. */
  backdrops?: HeroSlide[]
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}) {
  const primaryHref = safePublicHref(primary.href) || '/contact'
  const secondaryHref = safePublicHref(secondary.href) || '/about'
  const slides: HeroSlide[] = [
    { src: photo, kind: 'portrait' },
    ...backdrops.filter((slide) => slide.src && slide.src !== photo),
  ]
  return (
    <section className="personal-hero" aria-labelledby="hero-title">
      <div className="personal-wrap personal-hero-inner">
        <div className="personal-hero-copy">
          <h1 id="hero-title">{name}</h1>
          <p className="personal-hero-role">{role}</p>
          {tagline && <p className="personal-hero-tagline">{tagline}</p>}
        </div>
        <div className="personal-hero-portrait">
          <HeroSlides slides={slides} alt={`Portrait of ${name}`} />
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
