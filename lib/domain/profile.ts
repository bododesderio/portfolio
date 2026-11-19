import { z } from 'zod'
const timelineItem = z.object({
  year: z.string().optional(),
  title: z.string().min(1),
  organization: z.string().optional(),
  description: z.string().optional(),
  featured: z
    .union([z.boolean(), z.string()])
    .transform((value) => value === true || value === 'true')
    .optional(),
})
const roleItem = z.object({
  title: z.string().min(1),
  org: z.string().min(1),
  period: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
})
const valueItem = z.object({
  title: z.string().min(1),
  description: z.string(),
})
function readItems<S extends z.ZodTypeAny>(
  raw: string,
  schema: S
): z.infer<S>[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value) => {
      const item = schema.safeParse(value)
      return item.success ? [item.data] : []
    })
  } catch {
    return []
  }
}
export const readTimeline = (raw: string) => readItems(raw, timelineItem)
export const readRoles = (raw: string) => readItems(raw, roleItem)
export const readValues = (raw: string) => readItems(raw, valueItem)
const datedItem = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  period: z.string().optional(),
  description: z.string().optional(),
})
export const readDatedEntries = (raw: string) => readItems(raw, datedItem)
export function readStringList(raw: string): string[] {
  try {
    return z
      .array(z.string())
      .parse(JSON.parse(raw))
      .map((item) => item.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}
export function safePublicHref(value: string): string | null {
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null
  } catch {
    return null
  }
}
export function readNavigation(
  raw: string | null,
  fallback: Array<{ label: string; href: string; visible: boolean }>
) {
  if (!raw) return fallback
  try {
    const result = z
      .array(
        z.object({
          label: z.string().min(1),
          href: z.string(),
          visible: z.boolean(),
        })
      )
      .safeParse(JSON.parse(raw))
    if (!result.success) return fallback
    const seen = new Set<string>()
    return result.data.flatMap((link) => {
      const href = safePublicHref(link.href)
      if (!href || seen.has(href)) return []
      seen.add(href)
      return [
        {
          ...link,
          href,
          label:
            link.href === '/projects' && link.label === 'Projects'
              ? 'Work'
              : link.href === '/blog' && link.label === 'Blog'
                ? 'Writing'
                : link.label,
        },
      ]
    })
  } catch {
    return fallback
  }
}

/**
 * Every public profile, in display order. "social" are where people follow the
 * owner; "writing" are where the owner publishes code and articles.
 */
export const PROFILE_LINKS = [
  { label: 'Facebook', key: 'social.facebook', kind: 'social' },
  { label: 'Instagram', key: 'social.instagram', kind: 'social' },
  { label: 'X', key: 'social.twitter', kind: 'social' },
  { label: 'YouTube', key: 'social.youtube', kind: 'social' },
  { label: 'LinkedIn', key: 'social.linkedin', kind: 'social' },
  { label: 'GitHub', key: 'social.github', kind: 'writing' },
  { label: 'Medium', key: 'social.medium', kind: 'writing' },
] as const
export type ProfileLink = { label: (typeof PROFILE_LINKS)[number]['label']; kind: 'social' | 'writing'; href: string }

export function profileLinks(settings: Record<string, string | undefined>): ProfileLink[] {
  return PROFILE_LINKS.flatMap((item) => {
    const href = safePublicHref(settings[item.key] || '')
    return href && /^https?:/.test(href) ? [{ label: item.label, kind: item.kind, href }] : []
  })
}
