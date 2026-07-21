import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

export const PATCH = withAdmin(async ({ req, params }) => {
  const { id } = params
  const body = await req.json()
  const allowed = ['caption', 'isPublished', 'section', 'sortOrder'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const embed = await prisma.pageEmbed.update({ where: { id }, data })
  return NextResponse.json(embed)
}, { onError: 'Update failed.' })

export const DELETE = withAdmin(async ({ params }) => {
  await prisma.pageEmbed.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}, { onError: 'Delete failed.' })
