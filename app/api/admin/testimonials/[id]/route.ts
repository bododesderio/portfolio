import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  body: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  company: z.string().nullable().optional(),
  photoMediaId: z.string().nullable().optional(),
  pages: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const t = await prisma.testimonial.update({ where: { id: params.id }, data })
  return NextResponse.json(t)
}, { schema: patchSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.testimonial.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
