import Link from 'next/link'
import type { ReactNode } from 'react'
import { ContentsNavigation } from './ContentsNavigation'

export type ContentsItem = { id: string; label: string }
export function EntryLayout({
  children,
  contents = [],
  relatedHref = '/about',
  relatedLabel = 'The full story',
}: {
  children: ReactNode
  contents?: ContentsItem[]
  relatedHref?: string
  relatedLabel?: string
}) {
  return (
    <div
      className={`personal-entry-layout personal-wrap ${contents.length ? '' : 'personal-entry-layout-wide'}`}
    >
      {contents.length > 0 && (
        <aside className="personal-contents">
          <nav aria-label="On this page">
            <p>On this page</p>
            <ContentsNavigation items={contents} />
          </nav>
          <Link href={relatedHref}>
            {relatedLabel} <span aria-hidden="true">→</span>
          </Link>
        </aside>
      )}
      <div className="personal-entry">
        {children}
      </div>
    </div>
  )
}
export function EntryHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="personal-entry-heading">
      <p className="personal-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="personal-deck">{description}</p>}
    </header>
  )
}
export function EntrySection({
  id,
  title,
  href,
  linkLabel,
  children,
}: {
  id: string
  title: string
  href?: string
  linkLabel?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="personal-entry-section"
      aria-labelledby={`${id}-heading`}
    >
      <div className="personal-section-heading">
        <h2 id={`${id}-heading`}>{title}</h2>
        {href && (
          <Link href={href} className="personal-small-link">
            {linkLabel || 'Explore'} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
