import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const patchSchema = z.object({
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, themePreference: true, lastLogin: true, createdAt: true },
  })

  return NextResponse.json(me)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { themePreference } = patchSchema.parse(body)

    if (themePreference !== undefined) {
      await prisma.adminUser.update({
        where: { email: session.user.email },
        data: { themePreference },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
