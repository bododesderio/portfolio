import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'vimeo'] as const

const createSchema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  platform: z.enum(PLATFORMS),
  postId: z.string().min(1),
  originalUrl: z.string().url(),
  caption: z.string().optional(),
})

export const GET = withAdmin(async ({ req }) => {
  const page = req.nextUrl.searchParams.get('page')
  const where = page ? { page } : {}

  const embeds = await prisma.pageEmbed.findMany({
    where,
    orderBy: [{ page: 'asc' }, { section: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(embeds)
})

export const POST = withAdmin(async ({ req }) => {
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const maxOrder = await prisma.pageEmbed.aggregate({
      where: { page: data.page, section: data.section },
      _max: { sortOrder: true },
    })

    const embed = await prisma.pageEmbed.create({
      data: {
        ...data,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })
    return NextResponse.json(embed, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}, { onError: 'Create failed.' })
