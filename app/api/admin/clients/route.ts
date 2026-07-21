import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const schema = z.object({
  name: z.string().min(1),
  logoMediaId: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const POST = withAdmin(async ({ data }) => {
  const c = await prisma.client.create({ data })
  return NextResponse.json(c, { status: 201 })
}, { schema, onError: 'Create failed.' })
