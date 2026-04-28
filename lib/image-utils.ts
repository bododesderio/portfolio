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

/** Tiny SVG shimmer placeholder for non-Cloudinary images */
const SHIMMER_SVG = `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from('<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e2e2e2"/></svg>').toString('base64') : 'PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlMmUyIi8+PC9zdmc+'}`

/** Low-quality blurred placeholder (20px wide, very low quality) */
export function blurUrl(url: string): string {
  const match = url.match(CLOUDINARY_PATTERN)
  if (!match) return SHIMMER_SVG
  return insertTransform(url, 'w_20,q_10,e_blur:800,f_auto')
}

/** Check if a URL is a Cloudinary URL */
export function isCloudinary(url: string): boolean {
  return CLOUDINARY_PATTERN.test(url)
}

/** Thumbnail for grid views (400px, auto quality, auto format) */
export function thumbnailUrl(url: string, width = 400): string {
  return insertTransform(url, `w_${width},c_fill,g_auto,q_auto,f_auto`)
}

/** Full-size optimized (auto quality, auto format, max 2400px) */
export function optimizedUrl(url: string, maxWidth = 2400): string {
  return insertTransform(url, `w_${maxWidth},c_limit,q_auto,f_auto`)
}
