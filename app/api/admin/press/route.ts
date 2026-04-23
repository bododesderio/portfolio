import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const pressItemSchema = z.object({
  type:        z.enum(['essay', 'article', 'award', 'speaking']).default('article'),
  title:       z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  source:      z.string().min(1, 'Source is required.'),
  sourceUrl:   z.string().url().nullable().optional(),
  imageUrl:    z.string().nullable().optional(),
  imageAlt:    z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  downloadUrl: z.string().url().nullable().optional(),
  date:        z.string().nullable().optional(),
  visible:     z.boolean().default(true),
  order:       z.number().int().default(0),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.pressItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await req.json()
    const data = pressItemSchema.parse(raw)

    const item = await prisma.pressItem.create({ data })
    revalidatePath('/about')
    revalidatePath('/')
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}
