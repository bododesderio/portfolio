import path from 'node:path'
import sharp from 'sharp'

const cache = new Map<string, boolean>()

/**
 * True when a site image has transparency, i.e. a cut-out portrait that should
 * be shown whole rather than cropped. Only local files under public/ are read;
 * anything else is treated as a regular photograph.
 */
export async function isCutout(url: string): Promise<boolean> {
  if (!url.startsWith('/') || url.includes('..')) return false
  const known = cache.get(url)
  if (known !== undefined) return known
  let result = false
  try {
    const meta = await sharp(path.join(process.cwd(), 'public', url.split('?')[0])).metadata()
    result = Boolean(meta.hasAlpha)
  } catch (err) {
    console.warn(`[Hero] Could not read ${url} to check for transparency:`, (err as Error).message)
  }
  cache.set(url, result)
  return result
}
