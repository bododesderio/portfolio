import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllConfig, setConfig, clearConfigCache, CONFIG_KEYS } from '@/lib/config'

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
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}
