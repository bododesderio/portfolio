import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'
import { CACHE_TAGS, REVALIDATE_PROFILE } from '@/lib/data/cache-tags'
import { notifyAdmin } from '@/lib/domain/admin-notifications'
import {
  MAINTENANCE_KEYS,
  clearMaintenanceCache,
  getMaintenanceState,
} from '@/lib/domain/maintenance'

const schema = z.object({
  enabled: z.boolean(),
  message: z.string().trim().max(500),
  returnAt: z
    .string()
    .trim()
    .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Enter a valid return time.'),
})

export const GET = withAdmin(async () => {
  clearMaintenanceCache()
  return NextResponse.json(await getMaintenanceState())
})

export const PUT = withAdmin(
  async ({ data }) => {
    const previous = await getMaintenanceState()
    const values: Record<string, string> = {
      [MAINTENANCE_KEYS.enabled]: String(data.enabled),
      [MAINTENANCE_KEYS.message]: data.message,
      [MAINTENANCE_KEYS.returnAt]: data.returnAt ? new Date(data.returnAt).toISOString() : '',
    }
    for (const [key, value] of Object.entries(values))
      await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    clearMaintenanceCache()
    revalidateTag(CACHE_TAGS.siteSettings, REVALIDATE_PROFILE)
    if (previous.enabled !== data.enabled)
      await notifyAdmin({
        type: 'maintenance',
        title: data.enabled ? 'Maintenance mode turned on' : 'Maintenance mode turned off',
        body: data.enabled ? 'Visitors now see the maintenance page.' : 'The site is open to visitors again.',
        href: '/admin/system/maintenance',
      })
    return NextResponse.json(await getMaintenanceState())
  },
  { schema, onError: 'Could not save maintenance settings.' }
)
