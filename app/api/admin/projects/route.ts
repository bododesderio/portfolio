import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  order: z.number().int().default(0),
})

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string(),
  body: z.string(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed']).default('planned'),
  category: z.string().optional().nullable(),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  ongoing: z.boolean().default(false),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  images: z.array(imageSchema).default([]),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.findMany({
    include: { images: { orderBy: { order: 'asc' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { images, ...data } = schema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...data,
        category: data.category ?? null,
        featuredImageUrl: data.featuredImageUrl ?? null,
        featuredImageAlt: data.featuredImageAlt ?? null,
        liveUrl: data.liveUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        images: images.length > 0 ? {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            caption: img.caption ?? null,
            order: img.order ?? i,
          })),
        } : undefined,
      },
      include: { images: true },
    })

    revalidatePath('/projects')
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
