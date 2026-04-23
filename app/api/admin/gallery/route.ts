import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { mediaId, caption, category } = await req.json()
    if (!mediaId) return NextResponse.json({ error: 'mediaId required.' }, { status: 400 })

    const maxOrder = await prisma.galleryItem.aggregate({ _max: { order: true } })
    const item = await prisma.galleryItem.create({
      data: {
        mediaId,
        caption: caption ?? null,
        category: category ?? null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Failed to add to gallery.' }, { status: 500 })
  }
}
