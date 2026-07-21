import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

const updateSchema = z.object({
  type:        z.enum(['essay', 'article', 'award', 'speaking']).optional(),
  title:       z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  source:      z.string().min(1).optional(),
  sourceUrl:   z.string().url().nullable().optional(),
  imageUrl:    z.string().nullable().optional(),
  imageAlt:    z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  downloadUrl: z.string().url().nullable().optional(),
  date:        z.string().nullable().optional(),
  visible:     z.boolean().optional(),
  order:       z.number().int().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const { id } = params

  const item = await prisma.pressItem.update({ where: { id }, data })
  revalidatePath('/about')
  revalidatePath('/')
  return NextResponse.json(item)
}, { schema: updateSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.pressItem.delete({ where: { id: params.id } })
  revalidatePath('/about')
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
