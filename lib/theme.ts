/**
 * Theme utilities — converts an admin-configured hex brand color into a
 * full space-separated-RGB palette for injection into :root.
 */

export const DEFAULT_BRAND = '#C9A84C'

export function hexToRgbTriplet(hex: string): string | null {
  const match = hex.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)
  if (!match) return null
  let h = match[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60)      { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else              { r = c; g = 0; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function shift(hex: string, lightnessDelta: number): string {
  const triplet = hexToRgbTriplet(hex)
  if (!triplet) return hex
  const [r, g, b] = triplet.split(' ').map(Number)
  const [h, s, l] = rgbToHsl(r, g, b)
  const nextL = Math.max(0, Math.min(1, l + lightnessDelta))
  const [nr, ng, nb] = hslToRgb(h, s, nextL)
  return `${nr} ${ng} ${nb}`
}

export interface BrandPalette {
  brand: string
  brandLight: string
  brandDark: string
  scale: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
}

const SCALE_DELTAS: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, number> = {
  50:   0.38,
  100:  0.30,
  200:  0.19,
  300:  0.08,
  400:  0.03,
  500:  0.00,
  600: -0.08,
  700: -0.19,
  800: -0.30,
  900: -0.40,
}

export function derivePalette(hex: string): BrandPalette {
  const base = hexToRgbTriplet(hex)
  if (!base) return derivePalette(DEFAULT_BRAND)

  const scale = Object.fromEntries(
    (Object.entries(SCALE_DELTAS) as [string, number][]).map(([k, delta]) => [k, shift(hex, delta)]),
  ) as BrandPalette['scale']

  return {
    brand:      base,
    brandLight: shift(hex, 0.12),
    brandDark:  shift(hex, -0.14),
    scale,
  }
}

export function paletteToCssBlock(p: BrandPalette): string {
  return `
:root {
  --brand: ${p.brand};
  --brand-light: ${p.brandLight};
  --brand-dark: ${p.brandDark};
  --brand-50: ${p.scale[50]};
  --brand-100: ${p.scale[100]};
  --brand-200: ${p.scale[200]};
  --brand-300: ${p.scale[300]};
  --brand-400: ${p.scale[400]};
  --brand-500: ${p.scale[500]};
  --brand-600: ${p.scale[600]};
  --brand-700: ${p.scale[700]};
  --brand-800: ${p.scale[800]};
  --brand-900: ${p.scale[900]};
}`.trim()
}
