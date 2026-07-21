import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  caption: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const item = await prisma.galleryItem.update({ where: { id: params.id }, data })
  return NextResponse.json(item)
}, { schema: patchSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.galleryItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
