import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  page: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { page, ...data } = schema.parse(body)

    const row = await prisma.seoSettings.upsert({
      where: { page },
      update: data,
      create: { page, ...data },
    })

    revalidatePath(`/${page === 'home' ? '' : page}`)
    return NextResponse.json({ success: true, row })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
