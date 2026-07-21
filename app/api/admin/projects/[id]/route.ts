import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

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

export const GET = withAdmin(async ({ params }) => {
  const { id } = params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
})

export const PATCH = withAdmin(async ({ data: body, params }) => {
  const { images, ...data } = body
  const { id } = params

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
}, { schema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.project.delete({ where: { id: params.id } })
  revalidatePath('/projects')
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
