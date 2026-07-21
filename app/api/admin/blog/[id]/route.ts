import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/data/db'
import { notifySubscribersOfPost } from '@/lib/domain/notifications'
import { withAdmin } from '@/lib/util/with-admin'

const attributionSchema = z.object({
  photographer: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
}).nullable().optional()

const schema = z.object({
  title:   z.string().min(1).optional(),
  slug:    z.string().min(1).optional(),
  body:    z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional().nullable(),
  status:  z.enum(['draft', 'published']).optional(),
  featuredImageUrl:         z.string().min(1).optional(),
  featuredImageAlt:         z.string().min(1).optional(),
  featuredImageAttribution: attributionSchema,
  publishedAt: z.union([z.string(), z.null()]).optional(),
  notifySubscribers: z.boolean().optional(),
})

export const PATCH = withAdmin(async ({ data: body, params }) => {
  const { notifySubscribers, ...data } = body
  const { id } = params

  // Reject NOT-NULL fields being cleared.
  if (data.featuredImageUrl !== undefined && !data.featuredImageUrl) {
    return NextResponse.json({ error: 'Featured image is required.' }, { status: 400 })
  }
  if (data.featuredImageAlt !== undefined && !data.featuredImageAlt) {
    return NextResponse.json({ error: 'Alt text is required.' }, { status: 400 })
  }

  // Check if this is a new publish (going from draft → published)
  const existing = await prisma.blogPost.findUnique({ where: { id } })
  const isNewPublish = data.status === 'published' && existing?.status !== 'published'

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      featuredImageAttribution: data.featuredImageAttribution ?? undefined,
      publishedAt: data.status === 'published'
        ? (existing?.status === 'published' ? undefined : new Date())
        : data.status === 'draft' ? null : undefined,
    },
  })
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)

  // Notify subscribers if requested and this is a new publish
  let subscribersNotified = 0
  if (notifySubscribers && isNewPublish) {
    subscribersNotified = await notifySubscribersOfPost(post)
  }

  return NextResponse.json({ ...post, subscribersNotified })
}, { schema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.blogPost.delete({ where: { id: params.id } })
  revalidatePath('/blog')
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
