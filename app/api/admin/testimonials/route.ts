import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const schema = z.object({
  body: z.string().min(1),
  author: z.string().min(1),
  role: z.string().min(1),
  company: z.string().nullable().optional(),
  photoMediaId: z.string().nullable().optional(),
  pages: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const POST = withAdmin(async ({ data }) => {
  const t = await prisma.testimonial.create({ data })
  return NextResponse.json(t, { status: 201 })
}, { schema, onError: 'Create failed.' })
