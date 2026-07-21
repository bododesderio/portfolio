import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  homeFeatured: z.boolean().optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
})

export const POST = withAdmin(async ({ data }) => {
  const s = await prisma.service.create({ data })
  return NextResponse.json(s, { status: 201 })
}, { schema, onError: 'Create failed.' })
