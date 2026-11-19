import Link from 'next/link'
import { prisma } from '@/lib/data/db'
import { notFound } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Writing · Editor' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function BlogEditorPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'
  const post = isNew
    ? null
    : await prisma.blogPost.findUnique({ where: { id } }).catch(() => null)
  if (!isNew && !post) notFound()

  return (
    <div>
      <AdminPageHeader
        actions={
          post?.status === 'published' ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand"
            >
              View published piece
            </Link>
          ) : undefined
        }
        title={isNew ? 'A new piece of writing' : 'Edit your writing'}
        description={
          isNew
            ? 'Craft a new article. Featured image + alt text are required before publishing.'
            : 'Save changes, preview your piece, or manage its publication.'
        }
      />
      <BlogEditor post={post} />
    </div>
  )
}
