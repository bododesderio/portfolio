import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveLocally } from '@/lib/local-storage'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']

// Magic byte signatures for server-side file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const sigs = MAGIC_BYTES[mimeType]
  if (!sigs) return true // SVG and others pass through (text-based)
  return sigs.some(sig => sig.every((byte, i) => buffer[i] === byte))
}

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

    // Validate magic bytes to prevent MIME spoofing
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'File content does not match declared type.' }, { status: 400 })
    }

    // Strip <script> from SVG uploads
    if (file.type === 'image/svg+xml') {
      const svgContent = buffer.toString('utf-8')
      if (/<script[\s>]/i.test(svgContent) || /on\w+\s*=/i.test(svgContent)) {
        return NextResponse.json({ error: 'SVG contains disallowed script content.' }, { status: 400 })
      }
    }

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
