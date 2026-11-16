import Link from 'next/link'
import type { Metadata } from 'next'
import { EntryLayout, EntryHeading } from '@/components/personal/EntryLayout'
import {
  normalizeSearchQuery,
  searchPublicContent,
} from '@/lib/data/public-search'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
}
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = normalizeSearchQuery(
    typeof params.q === 'string' ? params.q : ''
  )
  let unavailable = false
  const results = await searchPublicContent(query).catch(() => {
    unavailable = true
    return []
  })
  return (
    <EntryLayout>
      <EntryHeading
        eyebrow="The personal archive"
        title="Search"
        description="Find a person, project, idea, or chapter of my story."
      />
      <form action="/search" method="get" className="personal-search-page-form">
        <label htmlFor="archive-search">Search the archive</label>
        <div>
          <input
            id="archive-search"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={120}
            placeholder="Try Rooibok, community, or technology"
          />
          <button type="submit">Search</button>
        </div>
      </form>
      <section
        aria-label="Search results"
        className="personal-search-page-results"
      >
        {unavailable ? (
          <p>Search is unavailable right now. Please try again shortly.</p>
        ) : query.length < 2 ? (
          <p>
            Enter at least two characters to search my public biography, work,
            and writing.
          </p>
        ) : (
          <>
            <p className="personal-muted">
              {results.length ? `${results.length} results` : 'No results'} for
              “{query}”
            </p>
            {results.map((result, index) => (
              <Link
                key={`${result.href}-${index}`}
                className="personal-search-result"
                href={result.href}
              >
                <span>{result.kind}</span>
                <h2>{result.title}</h2>
                <p>{result.excerpt}</p>
              </Link>
            ))}
          </>
        )}
      </section>
    </EntryLayout>
  )
}
