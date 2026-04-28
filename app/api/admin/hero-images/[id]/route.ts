import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { order, active } = body
    const data: { order?: number; active?: boolean } = {}
    if (typeof order === 'number') data.order = order
    if (typeof active === 'boolean') data.active = active

    const item = await prisma.heroImage.update({
      where: { id },
      data,
      include: { media: true },
    })
    return NextResponse.json(item)
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.heroImage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
