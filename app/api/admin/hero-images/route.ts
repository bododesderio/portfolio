import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' },
    include: { media: true },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { mediaId } = await req.json()
    if (!mediaId || typeof mediaId !== 'string') {
      return NextResponse.json({ error: 'mediaId is required' }, { status: 400 })
    }

    const count = await prisma.heroImage.count()
    const item = await prisma.heroImage.create({
      data: { mediaId, order: count, active: true },
      include: { media: true },
    })
    return NextResponse.json(item)
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'P2003') return NextResponse.json({ error: 'Invalid mediaId' }, { status: 400 })
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
