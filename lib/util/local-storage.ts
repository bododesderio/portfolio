/**
 * Local filesystem fallback for image storage when Cloudinary is unavailable.
 * Images are stored in public/uploads/ and served by Next.js static file serving.
 */
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { imageSize } from 'image-size'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export async function saveLocally(
  buffer: Buffer,
  originalFilename: string
): Promise<{
  publicId: string
  url: string
  width: number | undefined
  height: number | undefined
  format: string
}> {
  await mkdir(UPLOADS_DIR, { recursive: true })

  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'bin'
  const id = randomUUID()
  const filename = `${id}.${ext}`
  const filePath = join(UPLOADS_DIR, filename)

  await writeFile(filePath, buffer)

  // Try to get dimensions
  let width: number | undefined
  let height: number | undefined
  try {
    const dims = imageSize(buffer)
    width = dims.width
    height = dims.height
  } catch { /* non-image or unsupported format */ }

  return {
    publicId: `local:${id}`,
    url: `/uploads/${filename}`,
    width,
    height,
    format: ext,
  }
}
