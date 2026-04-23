import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'vimeo'] as const

const createSchema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  platform: z.enum(PLATFORMS),
  postId: z.string().min(1),
  originalUrl: z.string().url(),
  caption: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = req.nextUrl.searchParams.get('page')
  const where = page ? { page } : {}

  const embeds = await prisma.pageEmbed.findMany({
    where,
    orderBy: [{ page: 'asc' }, { section: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(embeds)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
}
