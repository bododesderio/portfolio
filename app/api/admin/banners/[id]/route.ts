import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { bannerInputSchema } from '@/lib/domain/banners'
import { withAdmin } from '@/lib/util/with-admin'

export const GET = withAdmin(async ({ params }) => {
  const banner = await prisma.banner.findUnique({ where: { id: params.id } })
  if (!banner) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(banner)
})

export const PATCH = withAdmin(async ({ data, params }) => {
  const { id } = params

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...data,
      startsAt: data.startsAt === undefined ? undefined : data.startsAt ? new Date(data.startsAt) : null,
      endsAt:   data.endsAt   === undefined ? undefined : data.endsAt   ? new Date(data.endsAt)   : null,
    },
  })
  return NextResponse.json(banner)
}, { schema: bannerInputSchema.partial(), onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.banner.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
