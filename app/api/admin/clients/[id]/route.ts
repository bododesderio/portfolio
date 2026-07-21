import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  logoMediaId: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const c = await prisma.client.update({ where: { id: params.id }, data })
  return NextResponse.json(c)
}, { schema: patchSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
