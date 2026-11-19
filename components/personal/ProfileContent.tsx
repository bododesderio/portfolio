import Link from 'next/link'
import { sanitizeHtml } from '@/lib/util/sanitize'
import { safePublicHref } from '@/lib/domain/profile'
import { PersonalIcon } from './PersonalIcon'

export function RichText({ html }: { html: string }) {
  return (
    <div
      className="personal-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}
export function PersonalTimeline({
  items,
  compact = false,
  details = true,
}: {
  items: Array<{
    year?: string
    title: string
    organization?: string
    description?: string
  }>
  compact?: boolean
  details?: boolean
}) {
  return (
    <ol className={`personal-timeline ${compact ? 'is-compact' : ''}`}>
      {items.map((item, index) => (
        <li key={`${item.year}-${index}`}>
          <span className="personal-timeline-date">{item.year}</span>
          <div>
            <h3>{item.title}</h3>
            {item.organization && (
              <p className="personal-timeline-org">{item.organization}</p>
            )}
            {!compact && details && item.description && (
              <p>{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
export function WorkRows({
  items,
}: {
  items: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    category: string | null
    status: string
  }>
}) {
  return (
    <div className="personal-work-rows">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/projects/${item.slug}`}
          className="personal-work-row"
        >
          <span className="personal-work-symbol">
            <PersonalIcon name="work" />
          </span>
          <div>
            <span className="personal-meta">{item.category || 'Project'}</span>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </div>
          <span className="personal-row-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ))}
    </div>
  )
}
export function WritingRows({
  items,
}: {
  items: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    publishedAt: Date | null
    category: string | null
  }>
}) {
  return (
    <div className="personal-writing-rows">
      {items.map((item) => (
        <article key={item.id}>
          <div className="personal-writing-date">
            {item.publishedAt ? (
              <time dateTime={item.publishedAt.toISOString()}>
                {item.publishedAt.toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
            ) : (
              'Essay'
            )}
          </div>
          <div>
            <p className="personal-meta">{item.category || 'Writing'}</p>
            <h3>
              <Link href={`/blog/${item.slug}`}>{item.title}</Link>
            </h3>
            <p>{item.excerpt}</p>
          </div>
          <Link
            className="personal-row-arrow"
            href={`/blog/${item.slug}`}
            aria-label={`Read ${item.title}`}
          >
            →
          </Link>
        </article>
      ))}
    </div>
  )
}
export function PressList({
  items,
}: {
  items: Array<{
    id: string
    title: string
    description: string
    source: string
    sourceUrl: string | null
    externalUrl: string | null
    downloadUrl: string | null
    date: string | null
  }>
}) {
  return (
    <div className="personal-press-list">
      {items.map((item) => {
        const href = safePublicHref(
          item.externalUrl || item.sourceUrl || item.downloadUrl || ''
        )
        return (
          <article key={item.id}>
            <p className="personal-meta">
              {[item.source, item.date].filter(Boolean).join(' · ')}
            </p>
            <h3>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {item.title} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                item.title
              )}
            </h3>
            <p>{item.description}</p>
          </article>
        )
      })}
    </div>
  )
}
