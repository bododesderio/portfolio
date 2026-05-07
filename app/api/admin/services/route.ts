import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

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

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const s = await prisma.service.create({ data })
    return NextResponse.json(s, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}
