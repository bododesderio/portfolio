import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { bannerInputSchema } from '@/lib/banners'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const banner = await prisma.banner.findUnique({ where: { id: (await params).id } })
  if (!banner) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(banner)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await req.json()
    const data = bannerInputSchema.partial().parse(raw)
    const { id } = await params

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        startsAt: data.startsAt === undefined ? undefined : data.startsAt ? new Date(data.startsAt) : null,
        endsAt:   data.endsAt   === undefined ? undefined : data.endsAt   ? new Date(data.endsAt)   : null,
      },
    })
    return NextResponse.json(banner)
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
    await prisma.banner.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
