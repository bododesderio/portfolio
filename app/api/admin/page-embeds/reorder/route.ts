import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { page, section, orderedIds } = await req.json() as {
      page: string
      section: string
      orderedIds: string[]
    }

    if (!page || !section || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'page, section, and orderedIds required.' }, { status: 400 })
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.pageEmbed.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Reorder failed.' }, { status: 500 })
  }
}
