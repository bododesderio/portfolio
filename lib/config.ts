import { prisma } from './db'

export const CONFIG_KEYS = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASS: 'SMTP_PASS',
  SMTP_FROM: 'SMTP_FROM',
  NEXTAUTH_SECRET: 'NEXTAUTH_SECRET',
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  ADMIN_PASSWORD_HASH: 'ADMIN_PASSWORD_HASH',
} as const

export type ConfigKey = keyof typeof CONFIG_KEYS

export interface ConfigEntry {
  masked: string
  source: 'db' | 'env'
  hasValue: boolean
}

const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { value: string; expiresAt: number }>()

export async function getConfig(key: string): Promise<string> {
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) return cached.value
  try {
    const row = await prisma.appConfig.findUnique({ where: { key } })
    if (row?.value) {
      cache.set(key, { value: row.value, expiresAt: Date.now() + CONFIG_CACHE_TTL })
      return row.value
    }
  } catch {
    // DB not ready — fall through to env
  }
  return process.env[key] ?? ''
}

export async function setConfig(key: string, value: string): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  cache.set(key, { value, expiresAt: Date.now() + CONFIG_CACHE_TTL })
}

export function clearConfigCache() {
  cache.clear()
}

export async function getAllConfig(): Promise<Record<string, ConfigEntry>> {
  const dbRows = await prisma.appConfig.findMany()
  const dbMap = new Map(dbRows.map((r: { key: string; value: string }) => [r.key, r.value]))

  const result: Record<string, ConfigEntry> = {}

  for (const key of Object.keys(CONFIG_KEYS)) {
    const dbVal = dbMap.get(key) as string | undefined
    const envVal = process.env[key] ?? ''
    const rawValue = dbVal ?? envVal
    const isSecret = key.includes('SECRET') || key.includes('PASS') || key.includes('PASSWORD')

    result[key] = {
      masked: rawValue
        ? isSecret
          ? `${'•'.repeat(Math.max(0, rawValue.length - 4))}${rawValue.slice(-4)}`
          : rawValue
        : '',
      source: dbVal ? 'db' : 'env',
      hasValue: !!rawValue,
    }
  }

  return result
}
