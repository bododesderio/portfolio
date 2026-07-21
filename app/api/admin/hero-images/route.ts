import { prisma } from '@/lib/data/db'
import { NextResponse } from 'next/server'
import { withAdmin } from '@/lib/util/with-admin'

export const GET = withAdmin(async () => {
  const items = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' },
    include: { media: true },
  })
  return NextResponse.json(items)
})

export const POST = withAdmin(async ({ req }) => {
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
}, { onError: 'Create failed' })
