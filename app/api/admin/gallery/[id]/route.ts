import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const patchSchema = z.object({
  caption: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const raw = await req.json()
    const data = patchSchema.parse(raw)
    const item = await prisma.galleryItem.update({ where: { id: (await params).id }, data })
    return NextResponse.json(item)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await prisma.galleryItem.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
