import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const updateSchema = z.object({
  type:        z.enum(['essay', 'article', 'award', 'speaking']).optional(),
  title:       z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  source:      z.string().min(1).optional(),
  sourceUrl:   z.string().url().nullable().optional(),
  imageUrl:    z.string().nullable().optional(),
  imageAlt:    z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  downloadUrl: z.string().url().nullable().optional(),
  date:        z.string().nullable().optional(),
  visible:     z.boolean().optional(),
  order:       z.number().int().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await req.json()
    const data = updateSchema.parse(raw)
    const { id } = await params

    const item = await prisma.pressItem.update({ where: { id }, data })
    revalidatePath('/about')
    revalidatePath('/')
    return NextResponse.json(item)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.pressItem.delete({ where: { id: (await params).id } })
    revalidatePath('/about')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
