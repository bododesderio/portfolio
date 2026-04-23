import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeUploadedImage } from '@/lib/media-uploads'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file.' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'JPEG, PNG, or WebP only.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Max 5MB.' }, { status: 400 })
    }

    const { url, width, height } = await writeUploadedImage({ category: 'login', file })

    await prisma.siteSettings.upsert({
      where: { key: 'login_background_url' },
      update: { value: url },
      create: { key: 'login_background_url', value: url },
    })

    const warnLowRes = (width ?? 0) < 1920 || (height ?? 0) < 1080
    return NextResponse.json({ success: true, url, width, height, warnLowRes })
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.siteSettings.delete({ where: { key: 'login_background_url' } }).catch(() => null)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Reset failed.' }, { status: 500 })
  }
}
