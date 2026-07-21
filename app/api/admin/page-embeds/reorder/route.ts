import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

export const POST = withAdmin(async ({ req }) => {
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
}, { onError: 'Reorder failed.' })
