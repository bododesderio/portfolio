import { NextResponse } from 'next/server'
import { z } from 'zod'
import { basePrisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

const markSchema = z.union([
  z.object({ ids: z.array(z.string().min(1)).min(1).max(200), read: z.boolean() }),
  z.object({ all: z.literal(true) }),
])

export const GET = withAdmin(async () => {
  const [items, unread] = await Promise.all([
    basePrisma.adminNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    basePrisma.adminNotification.count({ where: { readAt: null } }),
  ])
  return NextResponse.json({ items, unread })
})

export const PATCH = withAdmin(
  async ({ data }) => {
    if ('all' in data) {
      await basePrisma.adminNotification.updateMany({
        where: { readAt: null },
        data: { readAt: new Date() },
      })
    } else {
      await basePrisma.adminNotification.updateMany({
        where: { id: { in: data.ids } },
        data: { readAt: data.read ? new Date() : null },
      })
    }
    const unread = await basePrisma.adminNotification.count({ where: { readAt: null } })
    return NextResponse.json({ unread })
  },
  { schema: markSchema, onError: 'Could not update notifications.' }
)

/** Clears notifications that have been read, keeping anything still unread. */
export const DELETE = withAdmin(async () => {
  const { count } = await basePrisma.adminNotification.deleteMany({ where: { readAt: { not: null } } })
  return NextResponse.json({ deleted: count })
})
