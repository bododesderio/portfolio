import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Batch mode: { settings: [{ key, value }, ...] }
    if (Array.isArray(body.settings)) {
      let needsRevalidate = false
      for (const { key, value } of body.settings) {
        if (!key) continue
        await prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
        if (key.startsWith('theme.') || key.startsWith('nav.')) needsRevalidate = true
      }
      if (needsRevalidate) revalidatePath('/', 'layout')
      return NextResponse.json({ success: true })
    }

    // Single mode: { key, value }
    const { key, value } = body
    if (!key) return NextResponse.json({ error: 'Key required.' }, { status: 400 })

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

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
