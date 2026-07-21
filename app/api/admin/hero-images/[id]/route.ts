import { prisma } from '@/lib/data/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdmin } from '@/lib/util/with-admin'

const patchSchema = z.object({
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

export const PATCH = withAdmin(async ({ data, params }) => {
  try {
    const { id } = params

    const item = await prisma.heroImage.update({
      where: { id },
      data,
      include: { media: true },
    })
    return NextResponse.json(item)
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}, { schema: patchSchema, onError: 'Update failed' })

export const DELETE = withAdmin(async ({ params }) => {
  try {
    const { id } = params
    await prisma.heroImage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}, { onError: 'Delete failed' })
