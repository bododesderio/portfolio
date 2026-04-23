import { mkdir, readdir, rename, unlink, writeFile } from 'fs/promises'
import path from 'path'

/**
 * Write an uploaded image to `public/uploads/<category>/` with retention.
 * Uses sharp for webp conversion when available.
 */
export async function writeUploadedImage(opts: {
  category: string
  file: File
  keepLast?: number
}): Promise<{ url: string; width?: number; height?: number }> {
  const { category, file, keepLast = 3 } = opts

  const publicDir = path.join(process.cwd(), 'public', 'uploads', category)
  const archiveDir = path.join(publicDir, 'archive')
  await mkdir(publicDir, { recursive: true })
  await mkdir(archiveDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const timestamp = Date.now()
  const basename = `${category}-${timestamp}`

  let outPath = path.join(publicDir, `${basename}.webp`)
  let publicUrl = `/uploads/${category}/${basename}.webp`
  let width: number | undefined
  let height: number | undefined

  // Try sharp; if unavailable or throws, fall back to writing the original bytes.
  try {
    const sharpModule = await import('sharp').then(m => m.default ?? m)
    const pipeline = sharpModule(buffer)
    const meta = await pipeline.metadata()
    width = meta.width
    height = meta.height
    await pipeline.webp({ quality: 82 }).toFile(outPath)
  } catch {
    const ext = (file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? 'bin').toLowerCase()
    outPath = path.join(publicDir, `${basename}.${ext}`)
    publicUrl = `/uploads/${category}/${basename}.${ext}`
    await writeFile(outPath, buffer)
  }

  // Retention: move older files in publicDir (not in archive/) to archive/, prune beyond keepLast.
  try {
    const entries = await readdir(publicDir)
    const olderFiles = entries
      .filter(n => n !== 'archive' && n !== path.basename(outPath))
      .sort()
      .reverse()

    // Move each older file into archive.
    for (const old of olderFiles) {
      const from = path.join(publicDir, old)
      const to = path.join(archiveDir, old)
      await rename(from, to).catch(() => null)
    }

    // Prune archive beyond keepLast.
    const archived = await readdir(archiveDir).catch(() => [])
    if (archived.length > keepLast) {
      const sorted = archived.sort()
      const toDelete = sorted.slice(0, archived.length - keepLast)
      for (const old of toDelete) {
        await unlink(path.join(archiveDir, old)).catch(() => null)
      }
    }
  } catch {
    // Retention errors are non-fatal.
  }

  return { url: publicUrl, width, height }
}
