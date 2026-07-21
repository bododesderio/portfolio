import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

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

export const GET = withAdmin(async () => {
  const items = await prisma.pressItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(items)
})

export const POST = withAdmin(async ({ data }) => {
  const item = await prisma.pressItem.create({ data })
  revalidatePath('/about')
  revalidatePath('/')
  return NextResponse.json(item, { status: 201 })
}, { schema: pressItemSchema, onError: 'Create failed.' })
