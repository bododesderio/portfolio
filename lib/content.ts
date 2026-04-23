import { prisma } from './db'
import slugify from 'slugify'

// Content types based on SiteContent table
export type ContentField = {
  value: string
  type: 'text' | 'html' | 'image' | 'json' | 'bool'
}

export type PageContent = Record<string, ContentField | Record<string, ContentField>>

// Build-time safe: if the DB isn't reachable (e.g. during `next build` when Postgres
// isn't up), return empty defaults so Next can complete static analysis. At runtime
// with a live DB the queries work normally.
async function safely<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

// Get all content for a specific page
export async function getPageContent(page: string): Promise<Record<string, ContentField>> {
  return safely(async () => {
    const rows = await prisma.siteContent.findMany({
      where: { page },
      orderBy: [{ section: 'asc' }, { fieldKey: 'asc' }],
    })

    const content: Record<string, ContentField> = {}
    for (const row of rows) {
      const key = `${row.section}.${row.fieldKey}`
      content[key] = {
        value: row.value,
        type: row.fieldType as ContentField['type'],
      }
    }
    return content
  }, {})
}

// Helper to get a specific field
export function getField(content: Record<string, ContentField>, path: string): string {
  return content[path]?.value || ''
}

// Helper to get and parse JSON fields
export function getJsonField<T>(content: Record<string, ContentField>, path: string): T | null {
  const field = content[path]
  if (!field || field.type !== 'json') return null
  try {
    return JSON.parse(field.value) as T
  } catch {
    return null
  }
}

// Get site settings
export async function getSiteSettings(): Promise<Record<string, string>> {
  return safely(async () => {
    const rows = await prisma.siteSettings.findMany()
    const settings: Record<string, string> = {}
    for (const row of rows) settings[row.key] = row.value
    return settings
  }, {})
}

// Get a specific site setting
export async function getSiteSetting(key: string): Promise<string | null> {
  return safely(async () => {
    const setting = await prisma.siteSettings.findUnique({ where: { key } })
    return setting?.value || null
  }, null)
}

// SEO settings per page
export async function getSeoSettings(page: string) {
  return safely(async () => {
    return await prisma.seoSettings.findUnique({ where: { page } })
  }, null)
}

// Generate slug for blog posts
export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true })
}
