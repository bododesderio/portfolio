import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const media = await prisma.media.findMany({
    orderBy: { uploadedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      url: true,
      filename: true,
      altText: true,
      width: true,
      height: true,
      uploadedAt: true,
    },
  })

  return NextResponse.json(media)
}
