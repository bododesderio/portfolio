import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/resend'
import { renderNewPostNotification } from '@/lib/emails'

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await req.json()
    const { notifySubscribers, ...data } = schema.parse(raw)
    const { id } = await params

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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

async function notifySubscribersOfPost(post: { title: string; slug: string; excerpt: string }) {
  try {
    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } })
    if (subscribers.length === 0) return 0

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://bododesderio.com'
    const postUrl = `${siteUrl}/blog/${post.slug}`

    const html = await renderNewPostNotification({
      title: post.title,
      excerpt: post.excerpt,
      url: postUrl,
    })

    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      await sendEmail({
        to: batch.map(s => s.email),
        subject: `New post: ${post.title}`,
        html,
      }).catch(() => null)
    }

    return subscribers.length
  } catch {
    return 0
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.blogPost.delete({ where: { id: (await params).id } })
    revalidatePath('/blog')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
