import Link from 'next/link'
import type { ReactNode } from 'react'

export type ContentsItem = { id: string; label: string }
export function EntryLayout({
  children,
  contents = [],
}: {
  children: ReactNode
  contents?: ContentsItem[]
}) {
  const links = (
    <ol>
      {contents.map((item, index) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
  return (
    <div
      className={`personal-entry-layout personal-wrap ${contents.length ? '' : 'personal-entry-layout-wide'}`}
    >
      {contents.length > 0 && (
        <aside className="personal-contents">
          <nav aria-label="On this page">
            <p>On this page</p>
            {links}
          </nav>
          <Link href="/about">
            The full story <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      )}
      <div className="personal-entry">
        {contents.length > 0 && (
          <details className="personal-mobile-contents">
            <summary>On this page</summary>
            <nav aria-label="Page sections">{links}</nav>
          </details>
        )}
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
            {linkLabel || 'Explore'} <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
