import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveLocally } from '@/lib/local-storage'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file.' }, { status: 400 })

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 50 MB.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" not allowed.` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { publicId, url, width, height } = await saveLocally(buffer, file.name)

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url,
        storageId: publicId,
        type: 'image',
        size: file.size,
        width: width ?? null,
        height: height ?? null,
      },
    })

    return NextResponse.json(media)
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
