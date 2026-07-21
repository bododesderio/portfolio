import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

export const POST = withAdmin(async ({ req }) => {
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
}, { onError: 'Failed to add to gallery.' })
