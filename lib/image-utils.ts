/**
 * Cloudinary URL transform helpers for thumbnails and progressive loading.
 * Works by inserting transform segments into existing Cloudinary URLs.
 */

const CLOUDINARY_PATTERN = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)(\/.*)?(\/.+)$/

function insertTransform(url: string, transform: string): string {
  const match = url.match(CLOUDINARY_PATTERN)
  if (!match) return url // Not a Cloudinary URL — return as-is
  const [, base, , path] = match
  return `${base}/${transform}${path}`
}

/** Low-quality blurred placeholder (20px wide, very low quality) */
export function blurUrl(url: string): string {
  return insertTransform(url, 'w_20,q_10,e_blur:800,f_auto')
}

/** Thumbnail for grid views (400px, auto quality, auto format) */
export function thumbnailUrl(url: string, width = 400): string {
  return insertTransform(url, `w_${width},c_fill,g_auto,q_auto,f_auto`)
}

/** Full-size optimized (auto quality, auto format, max 2400px) */
export function optimizedUrl(url: string, maxWidth = 2400): string {
  return insertTransform(url, `w_${maxWidth},c_limit,q_auto,f_auto`)
}
