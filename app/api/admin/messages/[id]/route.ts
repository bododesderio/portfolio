import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const msg = await prisma.message.update({ where: { id: params.id }, data })
  return NextResponse.json(msg)
}, { schema: patchSchema, onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.message.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
