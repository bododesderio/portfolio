import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  order: z.number().int().default(0),
})

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed']).optional(),
  category: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional(),
  liveUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  ongoing: z.boolean().optional(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  images: z.array(imageSchema).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await req.json()
    const { images, ...data } = schema.parse(raw)
    const { id } = await params

    const updateData: Record<string, unknown> = { ...data }
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    })

    // Replace images if provided
    if (images !== undefined) {
      await prisma.projectImage.deleteMany({ where: { projectId: id } })
      if (images.length > 0) {
        await prisma.projectImage.createMany({
          data: images.map((img, i) => ({
            projectId: id,
            url: img.url,
            alt: img.alt ?? null,
            caption: img.caption ?? null,
            order: img.order ?? i,
          })),
        })
      }
    }

    const result = await prisma.project.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    })

    revalidatePath('/projects')
    revalidatePath(`/projects/${project.slug}`)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.project.delete({ where: { id: (await params).id } })
    revalidatePath('/projects')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
