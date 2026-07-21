import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllConfig, setConfig, clearConfigCache, CONFIG_KEYS } from '@/lib/config'
import { resetTransporter } from '@/lib/domain/mailer'

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await getAllConfig()
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { key, value } = await req.json()
    if (!key || !(key in CONFIG_KEYS)) {
      return NextResponse.json({ error: 'Invalid config key.' }, { status: 400 })
    }
    await setConfig(key, value)
    clearConfigCache()
    if (SMTP_KEYS.includes(key)) resetTransporter()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}
