import { pageMetadata } from '@/lib/seo/page-metadata'
import Link from 'next/link'
import { prisma } from '@/lib/data/db'
import { getPageContent, getField, getSiteSetting } from '@/lib/data/content'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { WritingRows } from '@/components/personal/ProfileContent'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { ldJson, blogIndexSchema } from '@/lib/schema'
import { safePublicHref } from '@/lib/domain/profile'
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return pageMetadata({
    page: 'blog',
    title: "Writing · Bodo Desderio",
    description:
      "Essays and notes by Bodo Desderio on technology, software engineering, SEO, leadership and building in Africa.",
    path: '/blog',
  })
}
export default async function WritingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const query =
    typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const category =
    typeof params.category === 'string' ? params.category.slice(0, 100) : ''
  const requestedPage = Number(params.page)
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 10000)
      : 1
  const where = {
    status: 'published',
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { excerpt: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }
  const [content, posts, total, categories, medium] = await Promise.all([
    getPageContent('blog'),
    prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * 12,
      take: 12,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.groupBy({
      by: ['category'],
      where: { status: 'published', category: { not: null } },
      orderBy: { category: 'asc' },
    }),
    getSiteSetting('social.medium'),
  ])
  function href(next: { category?: string; page?: number }) {
    const search = new URLSearchParams()
    if (query) search.set('q', query)
    if (next.category ?? category)
      search.set('category', next.category ?? category)
    if (next.page && next.page > 1) search.set('page', String(next.page))
    return `/blog${search.size ? `?${search}` : ''}`
  }
  const mediumUrl = safePublicHref(medium || '')
  return (
    <EntryLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(blogIndexSchema(posts)) }}
      />
      <EntryHeading
        eyebrow="Essays, notes & things on my mind"
        title="Writing"
        description={
          getField(content, 'hero.subtitle') ||
          'A notebook for the things I’m learning, questioning, and thinking about.'
        }
      />
      <form action="/blog" method="get" className="personal-search-page-form">
        <label htmlFor="writing-search">Find something to read</label>
        <div>
          <input
            type="search"
            id="writing-search"
            name="q"
            defaultValue={query}
            maxLength={120}
            placeholder="Search the writing archive"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button type="submit">Search</button>
        </div>
      </form>
      <nav className="personal-filter-list" aria-label="Writing topics">
        <Link
          href={href({ category: '' })}
          aria-current={!category ? 'page' : undefined}
        >
          All topics
        </Link>
        {categories.map((item) => (
          <Link
            key={item.category}
            href={href({ category: item.category! })}
            aria-current={category === item.category ? 'page' : undefined}
          >
            {item.category}
          </Link>
        ))}
      </nav>
      {posts.length ? (
        <WritingRows items={posts} />
      ) : (
        <p className="personal-empty">
          No writing matches this search.{' '}
          <Link href="/blog">Browse all writing.</Link>
        </p>
      )}
      {total > 12 && (
        <nav className="personal-pagination" aria-label="Writing pages">
          {page > 1 && <Link href={href({ page: page - 1 })}>← Previous</Link>}
          <span>
            Page {page} of {Math.ceil(total / 12)}
          </span>
          {page * 12 < total && (
            <Link href={href({ page: page + 1 })}>Next →</Link>
          )}
        </nav>
      )}
      {mediumUrl && (
        <p className="personal-footnote">
          There’s more of my writing on{' '}
          <a href={mediumUrl} target="_blank" rel="noopener noreferrer">
            Medium ↗
          </a>
          .
        </p>
      )}
      <section className="personal-subscribe">
        <div>
          <h2>Letters, occasionally.</h2>
          <p>New writing and a few things from my corner of the world.</p>
        </div>
        <NewsletterForm />
      </section>
    </EntryLayout>
  )
}
