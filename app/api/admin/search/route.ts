import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Result = {
  type: 'post' | 'media' | 'message' | 'subscriber' | 'client'
  id: string
  title: string
  href: string
  subtitle?: string
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (!q) return NextResponse.json([])
  if (q.length < 2) return NextResponse.json([])

  const results: Result[] = []

  try {
    const [posts, media, messages, subscribers, clients] = await Promise.all([
      prisma.blogPost.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { excerpt: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, title: true, slug: true, status: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.media.findMany({
        where: { OR: [{ filename: { contains: q, mode: 'insensitive' } }, { altText: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, filename: true, altText: true, url: true },
        take: 5,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.message.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { subject: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, name: true, subject: true, email: true },
        take: 5,
        orderBy: { receivedAt: 'desc' },
      }),
      prisma.subscriber.findMany({
        where: { OR: [{ email: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, email: true, name: true },
        take: 5,
        orderBy: { subscribedAt: 'desc' },
      }),
      prisma.client.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, website: true },
        take: 5,
      }),
    ])

    for (const p of posts) {
      results.push({
        type: 'post',
        id: p.id,
        title: p.title,
        href: `/admin/blog/${p.id}`,
        subtitle: p.status,
      })
    }
    for (const m of media) {
      results.push({
        type: 'media',
        id: m.id,
        title: m.altText || m.filename,
        href: `/admin/media`,
        subtitle: m.filename,
      })
    }
    for (const msg of messages) {
      results.push({
        type: 'message',
        id: msg.id,
        title: msg.subject,
        href: `/admin/messages`,
        subtitle: `${msg.name} · ${msg.email}`,
      })
    }
    for (const s of subscribers) {
      results.push({
        type: 'subscriber',
        id: s.id,
        title: s.email,
        href: `/admin/newsletter`,
        subtitle: s.name || undefined,
      })
    }
    for (const c of clients) {
      results.push({
        type: 'client',
        id: c.id,
        title: c.name,
        href: `/admin/clients`,
        subtitle: c.website || undefined,
      })
    }
  } catch {
    return NextResponse.json([], { status: 200 })
  }

  return NextResponse.json(results)
}
