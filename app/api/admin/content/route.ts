import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS, REVALIDATE_PROFILE } from '@/lib/data/cache-tags'
import { z } from 'zod'
import { sanitizeHtml } from '@/lib/util/sanitize'

const schema = z.object({
  page: z.string(),
  section: z.string(),
  field_key: z.string(),
  value: z.string(),
  field_type: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { page, section, field_key, value, field_type } = schema.parse(body)
    const safeValue = field_type === 'html' ? sanitizeHtml(value) : value

    const row = await prisma.siteContent.upsert({
      where: { page_section_fieldKey: { page, section, fieldKey: field_key } },
      update: { value: safeValue, ...(field_type ? { fieldType: field_type } : {}) },
      create: { page, section, fieldKey: field_key, value: safeValue, fieldType: field_type || 'text' },
    })

    revalidateTag(CACHE_TAGS.siteContent, REVALIDATE_PROFILE)
    revalidatePath(`/${page === 'home' ? '' : page}`)

    return NextResponse.json({ success: true, updated_at: row.updatedAt })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
