import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/resend'
import { renderNewPostNotification } from '@/lib/emails'
import { z } from 'zod'

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

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { notifySubscribers, ...data } = schema.parse(body)
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
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
