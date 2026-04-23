import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Post — Admin' }

interface Props { params: Promise<{ id: string }> }

export default async function BlogEditorPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'
  const post = isNew ? null : await prisma.blogPost.findUnique({ where: { id } }).catch(() => null)
  if (!isNew && !post) notFound()

  return (
    <div>
      <AdminPageHeader
        title={isNew ? 'New Post' : 'Edit Post'}
        description={isNew ? 'Craft a new article. Featured image + alt text are required before publishing.' : 'Edit and republish.'}
      />
      <BlogEditor post={post} />
    </div>
  )
}
