import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const raw = await req.json()
    const data = patchSchema.parse(raw)
    const t = await prisma.testimonial.update({ where: { id: (await params).id }, data })
    return NextResponse.json(t)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await prisma.testimonial.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
