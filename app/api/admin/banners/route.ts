import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { bannerInputSchema } from '@/lib/domain/banners'
import { withAdmin } from '@/lib/util/with-admin'

export const GET = withAdmin(async () => {
  const rows = await prisma.banner.findMany({
    orderBy: [{ enabled: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(rows)
})

export const POST = withAdmin(async ({ data }) => {
  const banner = await prisma.banner.create({
    data: {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt:   data.endsAt   ? new Date(data.endsAt)   : null,
    },
  })
  return NextResponse.json(banner, { status: 201 })
}, { schema: bannerInputSchema, onError: 'Create failed.' })
