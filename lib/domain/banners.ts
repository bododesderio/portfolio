import { z } from 'zod'

export const BANNER_KINDS = ['topbar', 'bottombar', 'modal', 'corner', 'cookie'] as const
export const BANNER_PLACEMENTS = ['top', 'bottom', 'left', 'right', 'center'] as const
export const BANNER_CTA_VARIANTS = ['primary', 'outline', 'invert'] as const
export const BANNER_THEMES = ['auto', 'light', 'dark', 'brand'] as const
export const BANNER_DEVICES = ['mobile', 'tablet', 'desktop'] as const
export const BANNER_EVENTS = ['impression', 'click', 'dismiss', 'conversion'] as const

export type BannerKind = typeof BANNER_KINDS[number]
export type BannerEvent = typeof BANNER_EVENTS[number]

export const bannerInputSchema = z.object({
  name:            z.string().min(1).max(120),
  kind:            z.enum(BANNER_KINDS),
  placement:       z.enum(BANNER_PLACEMENTS).default('bottom'),
  title:           z.string().max(200).optional().nullable(),
  body:            z.string().max(4000).optional().nullable(),
  imageUrl:        z.string().optional().nullable(),
  ctaLabel:        z.string().max(60).optional().nullable(),
  ctaUrl:          z.string().optional().nullable(),
  ctaVariant:      z.enum(BANNER_CTA_VARIANTS).default('primary'),
  dismissable:     z.boolean().default(true),
  requireConsent:  z.boolean().default(false),
  theme:           z.enum(BANNER_THEMES).default('auto'),

  enabled:         z.boolean().default(false),
  priority:        z.number().int().default(0),
  startsAt:        z.union([z.string(), z.null()]).optional(),
  endsAt:          z.union([z.string(), z.null()]).optional(),
  pagesInclude:    z.array(z.string()).default([]),
  pagesExclude:    z.array(z.string()).default([]),
  devices:         z.array(z.enum(BANNER_DEVICES)).default([]),

  showOnce:        z.boolean().default(false),
  cooldownHours:   z.number().int().min(0).default(0),
  delaySeconds:    z.number().int().min(0).default(0),
  scrollTrigger:   z.number().int().min(0).max(100).optional().nullable(),
  exitIntent:      z.boolean().default(false),
  newsletterHook:  z.boolean().default(false),
})

export type BannerInput = z.infer<typeof bannerInputSchema>

export const bannerEventSchema = z.object({
  id:    z.string().min(1),
  event: z.enum(BANNER_EVENTS),
})

export interface PublicBanner {
  id: string
  kind: BannerKind
  placement: string
  title: string | null
  body: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  ctaVariant: string
  dismissable: boolean
  requireConsent: boolean
  theme: string
  priority: number
  pagesInclude: string[]
  pagesExclude: string[]
  devices: string[]
  showOnce: boolean
  cooldownHours: number
  delaySeconds: number
  scrollTrigger: number | null
  exitIntent: boolean
  newsletterHook: boolean
}

/** Does a path match include/exclude rules? */
export function matchesPath(path: string, include: string[], exclude: string[]): boolean {
  if (path.startsWith('/admin') || path.startsWith('/api')) return false
  if (exclude.some(prefix => prefix && (path === prefix || path.startsWith(prefix + '/')))) return false
  if (include.length === 0) return true
  return include.some(prefix => prefix === '/' ? path === '/' : (path === prefix || path.startsWith(prefix + '/')))
}
