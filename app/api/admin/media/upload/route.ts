import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { saveLocally } from '@/lib/local-storage'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file.' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let publicId: string
    let url: string
    let width: number | undefined
    let height: number | undefined

    // Try Cloudinary first, fall back to local filesystem
    const tmpPath = join(tmpdir(), `upload_${Date.now()}_${file.name}`)
    await writeFile(tmpPath, buffer)

    try {
      const result = await uploadToCloudinary(tmpPath, 'portfolio')
      publicId = result.publicId
      url = result.url
      width = result.width
      height = result.height
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError)
      const local = await saveLocally(buffer, file.name)
      publicId = local.publicId
      url = local.url
      width = local.width
      height = local.height
    } finally {
      await unlink(tmpPath).catch(() => null)
    }

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url,
        cloudinaryId: publicId,
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
