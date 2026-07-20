import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  logoMediaId: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const c = await prisma.client.create({ data })
    return NextResponse.json(c, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}
