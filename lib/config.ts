import { prisma } from './db'

export const CONFIG_KEYS = {
  CLOUDINARY_CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME',
  CLOUDINARY_API_KEY: 'CLOUDINARY_API_KEY',
  CLOUDINARY_API_SECRET: 'CLOUDINARY_API_SECRET',
  RESEND_API_KEY: 'RESEND_API_KEY',
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

const cache = new Map<string, string>()

export async function getConfig(key: string): Promise<string> {
  if (cache.has(key)) return cache.get(key)!
  try {
    const row = await prisma.appConfig.findUnique({ where: { key } })
    if (row?.value) {
      cache.set(key, row.value)
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
  cache.set(key, value)
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
    const isSecret = key.includes('SECRET') || key.includes('API_SECRET') || key.includes('PASSWORD')

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
