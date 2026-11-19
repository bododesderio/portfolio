import { basePrisma } from '@/lib/data/db'

export const MAINTENANCE_KEYS = {
  enabled: 'maintenance.enabled',
  message: 'maintenance.message',
  returnAt: 'maintenance.return_at',
} as const

export const DEFAULT_MAINTENANCE_MESSAGE =
  'I’m updating the site and it will be back shortly. You can still reach me by email.'

export type MaintenanceState = {
  enabled: boolean
  message: string
  returnAt: string | null
}

/**
 * The proxy checks this on every page request, so it is held in memory briefly
 * instead of querying Postgres each time. The admin route clears it on save.
 */
const CACHE_MS = 10_000
let cached: { state: MaintenanceState; at: number } | null = null

export function clearMaintenanceCache() {
  cached = null
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.state
  let state: MaintenanceState = { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE, returnAt: null }
  try {
    const rows = await basePrisma.siteSettings.findMany({
      where: { key: { in: Object.values(MAINTENANCE_KEYS) } },
    })
    const value = (key: string) => rows.find((row) => row.key === key)?.value ?? ''
    state = {
      enabled: value(MAINTENANCE_KEYS.enabled) === 'true',
      message: value(MAINTENANCE_KEYS.message).trim() || DEFAULT_MAINTENANCE_MESSAGE,
      returnAt: value(MAINTENANCE_KEYS.returnAt) || null,
    }
  } catch (error) {
    // Failing open keeps the site up if the settings table is briefly unreachable.
    console.error('[maintenance] could not read state; serving the site normally', error)
  }
  cached = { state, at: Date.now() }
  return state
}

/** Pages a visitor would see; APIs, assets, the admin and sign-in stay reachable. */
export function isMaintainedPath(pathname: string) {
  return !/^\/(?:admin|api|_next|maintenance|robots\.txt|favicon|images|uploads|identity|docs)(?:\/|$|\.)/.test(
    pathname
  )
}
