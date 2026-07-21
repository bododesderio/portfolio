import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS, REVALIDATE_PROFILE } from '@/lib/data/cache-tags'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'

const settingEntrySchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().max(20_000),
})

const singleSettingSchema = settingEntrySchema
const batchSettingsSchema = z.object({ settings: z.array(settingEntrySchema).max(200) })

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Batch mode: { settings: [{ key, value }, ...] }
    if (Array.isArray(body.settings)) {
      const batch = batchSettingsSchema.safeParse(body)
      if (!batch.success) {
        return NextResponse.json(
          { error: batch.error.issues[0]?.message ?? 'Invalid settings payload.' },
          { status: 400 },
        )
      }

      let needsRevalidate = false
      for (const { key, value } of batch.data.settings) {
        await prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
        if (key.startsWith('theme.') || key.startsWith('nav.')) needsRevalidate = true
      }
      revalidateTag(CACHE_TAGS.siteSettings, REVALIDATE_PROFILE)
      if (needsRevalidate) revalidatePath('/', 'layout')
      return NextResponse.json({ success: true })
    }

    // Single mode: { key, value }
    const parsed = singleSettingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Key required.' },
        { status: 400 },
      )
    }
    const { key, value } = parsed.data

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    revalidateTag(CACHE_TAGS.siteSettings, REVALIDATE_PROFILE)

    // Theme and nav changes affect the server-rendered layout, so every page
    // needs a fresh render to pick up the new values.
    if (key.startsWith('theme.') || key.startsWith('nav.')) {
      revalidatePath('/', 'layout')
    }

    return NextResponse.json({ success: true, setting })
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}
