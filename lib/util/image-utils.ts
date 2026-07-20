/**
 * Image utility helpers.
 * Previously contained Cloudinary transforms; now images are served locally.
 * Functions return the original URL unchanged (no-op) to maintain
 * compatibility with components that still call them.
 */

const SHIMMER_SVG = `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from('<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e2e2e2"/></svg>').toString('base64') : 'PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlMmUyIi8+PC9zdmc+'}`

/** Low-quality placeholder — returns a shimmer SVG for local images */
export function blurUrl(_url: string): string {
  return SHIMMER_SVG
}

/** Thumbnail — returns URL unchanged (Next.js Image handles resizing) */
export function thumbnailUrl(url: string, _width = 400): string {
  return url
}

/** Optimized URL — returns URL unchanged (Next.js Image handles optimization) */
export function optimizedUrl(url: string, _maxWidth = 2400): string {
  return url
}
