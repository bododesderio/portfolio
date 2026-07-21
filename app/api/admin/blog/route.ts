import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/data/db'
import { notifySubscribersOfPost } from '@/lib/domain/notifications'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const attributionSchema = z.object({
  photographer: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
}).nullable().optional()

const schema = z.object({
  title:   z.string().min(1),
  slug:    z.string().min(1),
  body:    z.string(),
  excerpt: z.string(),
  category: z.string().optional().nullable(),
  status:  z.enum(['draft', 'published']).default('draft'),
  featuredImageUrl:         z.string().min(1, 'Featured image is required'),
  featuredImageAlt:         z.string().min(1, 'Alt text is required'),
  featuredImageAttribution: attributionSchema,
  notifySubscribers: z.boolean().optional(),
})

export const POST = withAdmin(async ({ data: body }) => {
  const { notifySubscribers, ...data } = body
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      category: data.category ?? null,
      featuredImageAttribution: data.featuredImageAttribution ?? undefined,
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  })
  revalidatePath('/blog')

  // Notify subscribers if publishing immediately
  let subscribersNotified = 0
  if (notifySubscribers && data.status === 'published') {
    subscribersNotified = await notifySubscribersOfPost(post)
  }

  return NextResponse.json({ ...post, subscribersNotified }, { status: 201 })
}, { schema, onError: 'Server error.' })
