import { prisma } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { FileText, Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  const published = posts.filter(p => p.status === 'published').length
  const drafts = posts.filter(p => p.status === 'draft').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminPageHeader
          title="Blog Posts"
          description={`${posts.length} total · ${published} published · ${drafts} drafts`}
        />
        <Link
          href="/admin/blog/new"
          className="px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
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
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-card rounded-2xl border border-hairline p-5 hover:border-brand/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/blog/${post.id}`} className="block">
                    <h3 className="font-medium text-fg line-clamp-1 hover:text-brand transition-colors">{post.title}</h3>
                  </Link>
                  <p className="text-xs text-fg-muted mt-0.5">/blog/{post.slug}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${
                  post.status === 'published'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {post.status}
                </span>
              </div>

              {post.excerpt && (
                <p className="text-sm text-fg-muted line-clamp-2 mb-3">{post.excerpt}</p>
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
                <div className="flex items-center gap-3">
                  <Link href={`/admin/blog/${post.id}`} className="text-brand hover:underline text-xs font-medium">Edit</Link>
                  <DeletePostButton id={post.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
