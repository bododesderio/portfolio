import { prisma } from '@/lib/data/db'
import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Plus, FileText } from 'lucide-react'
import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { CollectionToolbar } from '@/components/admin/CollectionToolbar'
export const metadata: Metadata = { title: 'Writing · Studio' }
export const dynamic = 'force-dynamic'
export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const query =
    typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const status = ['draft', 'published'].includes(params.status || '')
    ? params.status!
    : 'all'
  const where: Prisma.BlogPostWhereInput = {
    ...(status !== 'all' ? { status } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [total, counts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  )
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      updatedAt: true,
    },
  })
  const all = counts.reduce((sum, row) => sum + row._count._all, 0)
  const base = new URLSearchParams()
  if (query) base.set('q', query)
  if (status !== 'all') base.set('status', status)
  return (
    <div>
      <AdminPageHeader
        title="Writing"
        description="Your notebook, from the first draft to the published piece."
        actions={
          <Link href="/admin/blog/new" className="admin-primary-button">
            <Plus size={16} />
            New piece
          </Link>
        }
      />
      <CollectionToolbar
        basePath="/admin/blog"
        query={query}
        status={status}
        label="Writing"
        filters={[
          { value: 'all', label: 'All writing', count: all },
          {
            value: 'draft',
            label: 'Drafts',
            count: counts.find((c) => c.status === 'draft')?._count._all || 0,
          },
          {
            value: 'published',
            label: 'Published',
            count:
              counts.find((c) => c.status === 'published')?._count._all || 0,
          },
        ]}
      />
      <div className="admin-panel">
        {posts.length ? (
          posts.map((post) => (
            <article key={post.id} className="admin-collection-row">
              <Link
                href={`/admin/blog/${post.id}`}
                className="admin-collection-entry"
              >
                <span className="admin-collection-thumb">
                  {post.featuredImageUrl ? (
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || ''}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <FileText size={20} />
                  )}
                </span>
                <div>
                  <h2>{post.title}</h2>
                  <p>
                    {post.category || 'Uncategorized'} · /{post.slug}
                  </p>
                </div>
              </Link>
              <span className="admin-status" data-status={post.status}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <time
                className="admin-collection-date"
                dateTime={post.updatedAt.toISOString()}
              >
                {post.updatedAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
              <div>
                <DeletePostButton id={post.id} />
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            <FileText size={25} className="mx-auto mb-3" />
            <p>
              {query || status !== 'all'
                ? 'No writing matches these filters.'
                : 'An idea is a good place to begin.'}
            </p>
            <Link
              href={all ? '/admin/blog' : '/admin/blog/new'}
              className="text-brand inline-block mt-3"
            >
              {all ? 'Clear filters' : 'Write your first piece'}
            </Link>
          </div>
        )}
      </div>
      <p className="admin-results-count">
        {total} {total === 1 ? 'piece' : 'pieces'}
        {query ? ' matching your search' : ''}
      </p>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/admin/blog${base.size ? `?${base}` : ''}`}
      />
    </div>
  )
}
