import { prisma } from '@/lib/data/db'

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

const ENCRYPTED_PREFIX = 'enc:v1:'
const SECRET_KEY_PATTERN = /(SECRET|PASS|PASSWORD|KEY|TOKEN)/
const encoder = new TextEncoder()

function keyMaterial(): string {
  return process.env.CONFIG_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ''
}

function shouldEncrypt(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key)
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64')
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value, 'base64'))
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function encryptionKey(): Promise<CryptoKey | null> {
  const material = keyMaterial()
  if (!material || !globalThis.crypto?.subtle) return null
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(material))
  return globalThis.crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

async function encryptValue(key: string, value: string): Promise<string> {
  if (!value || !shouldEncrypt(key) || value.startsWith(ENCRYPTED_PREFIX)) return value
  const secret = await encryptionKey()
  if (!secret) return value

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(key) },
    secret,
    encoder.encode(value),
  )

  return `${ENCRYPTED_PREFIX}${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(ciphertext))}`
}

async function decryptValue(key: string, value: string): Promise<string> {
  if (!value.startsWith(ENCRYPTED_PREFIX)) return value
  const secret = await encryptionKey()
  if (!secret) return ''

  try {
    const encoded = value.slice(ENCRYPTED_PREFIX.length)
    const [ivB64, ciphertextB64] = encoded.split(':')
    if (!ivB64 || !ciphertextB64) return ''

    const iv = base64ToBytes(ivB64) as unknown as BufferSource
    const ciphertext = base64ToBytes(ciphertextB64) as unknown as BufferSource
    const plaintext = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: encoder.encode(key) },
      secret,
      ciphertext,
    )
    return new TextDecoder().decode(plaintext)
  } catch {
    return ''
  }
}

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
      const value = await decryptValue(key, row.value)
      cache.set(key, { value, expiresAt: Date.now() + CONFIG_CACHE_TTL })
      return value
    }
  } catch {
    // DB not ready — fall through to env
  }
  return process.env[key] ?? ''
}

export async function setConfig(key: string, value: string): Promise<void> {
  const storedValue = await encryptValue(key, value)
  await prisma.appConfig.upsert({
    where: { key },
    update: { value: storedValue },
    create: { key, value: storedValue },
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
    const rawValue = dbVal ? await decryptValue(key, dbVal) : envVal
    const isSecret = SECRET_KEY_PATTERN.test(key)

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
