import { prisma } from '@/lib/data/db'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { FileText, Plus, ImageIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog — Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminBlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.blogPost.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const published = posts.filter(p => p.status === 'published').length
  const drafts = posts.filter(p => p.status === 'draft').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminPageHeader
          title="Blog Posts"
          description={`${total} total · ${published} published · ${drafts} drafts`}
        />
        <Link
          href="/admin/blog/new"
          className="px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      {posts.length === 0 && page === 1 ? (
        <div className="rounded-2xl border border-hairline bg-card p-16 text-center">
          <FileText className="h-10 w-10 text-fg-muted mx-auto mb-4" />
          <p className="text-fg-muted mb-4">No posts yet. Write your first blog post.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}`}
                className="group bg-card rounded-2xl border border-hairline overflow-hidden hover:border-brand/30 transition-colors flex flex-col"
              >
                {/* Featured image */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  {post.featuredImageUrl ? (
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-fg-muted/40" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm ${
                    post.status === 'published'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-amber-500/90 text-white'
                  }`}>
                    {post.status}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-medium text-fg line-clamp-1 group-hover:text-brand transition-colors">{post.title}</h3>
                  <p className="text-xs text-fg-muted mt-0.5 mb-2">/blog/{post.slug}</p>

                  {post.excerpt && (
                    <p className="text-sm text-fg-muted line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-hairline">
                    <div className="flex items-center gap-3 text-xs text-fg-muted">
                      {post.category && (
                        <span className="px-2 py-0.5 rounded bg-muted">{post.category}</span>
                      )}
                      <span>
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                          : `Draft · ${format(new Date(post.createdAt), 'MMM d')}`
                        }
                      </span>
                    </div>
                    <DeletePostButton id={post.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/blog" />
        </>
      )}
    </div>
  )
}
