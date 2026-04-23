import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getConfig, setConfig } from '@/lib/config'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { currentPassword, newPassword } = schema.parse(body)

    const currentHash = await getConfig('ADMIN_PASSWORD_HASH')
    if (!currentHash) {
      return NextResponse.json({ error: 'No existing password hash configured.' }, { status: 500 })
    }

    const matches = await bcrypt.compare(currentPassword, currentHash)
    if (!matches) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await setConfig('ADMIN_PASSWORD_HASH', newHash)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0]
      return NextResponse.json({ error: first?.message ?? 'Invalid input.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
