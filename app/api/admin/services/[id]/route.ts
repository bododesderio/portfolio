import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  homeFeatured: z.boolean().optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const s = await prisma.service.update({ where: { id: params.id }, data })
  return NextResponse.json(s)
}, { schema: patchSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.service.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
