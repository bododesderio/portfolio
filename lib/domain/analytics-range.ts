/** Date ranges for the analytics screen. Pure, so it is unit-tested without a database. */
export const RANGE_PRESETS = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  '12m': { label: 'Last 12 months', days: 365 },
} as const
export type RangePreset = keyof typeof RANGE_PRESETS
export type Granularity = 'day' | 'week' | 'month'

export type AnalyticsRange = {
  preset: RangePreset | 'custom'
  label: string
  from: Date
  to: Date
  previousFrom: Date
  previousTo: Date
  days: number
  granularity: Granularity
}

const DAY = 86_400_000
const MAX_CUSTOM_DAYS = 3 * 366
const isoDay = /^\d{4}-\d{2}-\d{2}$/

function granularityFor(days: number): Granularity {
  if (days <= 62) return 'day'
  if (days <= 190) return 'week'
  return 'month'
}

/** Kampala is UTC+3 all year, so a calendar day there starts at 21:00 UTC the day before. */
function kampalaDayStart(value: string) {
  return new Date(`${value}T00:00:00+03:00`)
}

export function parseRange(
  params: { range?: string; from?: string; to?: string },
  now = new Date()
): AnalyticsRange {
  if (params.range === 'custom' && params.from && params.to && isoDay.test(params.from) && isoDay.test(params.to)) {
    const from = kampalaDayStart(params.from)
    const to = new Date(kampalaDayStart(params.to).getTime() + DAY - 1)
    const days = Math.round((to.getTime() - from.getTime() + 1) / DAY)
    if (!Number.isNaN(from.getTime()) && to > from && days <= MAX_CUSTOM_DAYS) {
      return {
        preset: 'custom',
        label: `${params.from} to ${params.to}`,
        from,
        to,
        previousFrom: new Date(from.getTime() - days * DAY),
        previousTo: new Date(from.getTime() - 1),
        days,
        granularity: granularityFor(days),
      }
    }
  }
  const preset: RangePreset = params.range && params.range in RANGE_PRESETS ? (params.range as RangePreset) : '30d'
  const { days, label } = RANGE_PRESETS[preset]
  const to = now
  const from = new Date(now.getTime() - days * DAY)
  return {
    preset,
    label,
    from,
    to,
    previousFrom: new Date(from.getTime() - days * DAY),
    previousTo: from,
    days,
    granularity: granularityFor(days),
  }
}

/** Percentage change against the previous period; null when there is nothing to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}

/** Section of the public site a path belongs to, for the "where people read" breakdown. */
export function sectionForPath(path: string) {
  if (path === '/' || path === '') return 'Home'
  const first = path.split('/')[1]
  return (
    {
      about: 'About',
      projects: 'Work',
      blog: 'Writing',
      gallery: 'Gallery',
      contact: 'Contact',
      services: 'Capabilities',
      search: 'Search',
    }[first] ?? 'Other pages'
  )
}

/** Reduces a referrer URL to its site, dropping "www." and paths. */
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    return new URL(referrer).hostname.replace(/^www\./, '') || null
  } catch {
    return null
  }
}
