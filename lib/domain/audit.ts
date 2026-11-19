import type { Prisma } from '@prisma/client'

/** System-written tables; logging them would only record the logger itself or visitor traffic. */
export const UNAUDITED_MODELS = new Set([
  'AuditLog',
  'ErrorReport',
  'AdminNotification',
  'PageView',
  'EmailLog',
  'EmailEvent',
])

const SECRET_FIELD = /pass(word)?|secret|token|hash|api_?key|private/i
const SECRET_SETTING_KEY = /pass(word)?|secret|token|api_?key|private/i
const MAX_TEXT = 280

type Row = Record<string, unknown>

function truncate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > MAX_TEXT)
    return `${value.slice(0, MAX_TEXT)}… (${value.length} characters)`
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.length > 20 ? `${value.length} items` : value.map(truncate)
  return value
}

/** Removes secrets and shortens long text so a log row stays small and safe to display. */
export function redactRow(model: string, row: unknown): Row | null {
  if (!row || typeof row !== 'object') return null
  const source = row as Row
  const settingKey = typeof source.key === 'string' ? source.key : ''
  const hideValue =
    model === 'AppConfig' || (model === 'SiteSettings' && SECRET_SETTING_KEY.test(settingKey))
  const out: Row = {}
  for (const [field, value] of Object.entries(source)) {
    if (SECRET_FIELD.test(field) || (hideValue && field === 'value')) out[field] = '[hidden]'
    else out[field] = truncate(value)
  }
  return out
}

const IGNORED_DIFF_FIELDS = new Set(['updatedAt', 'createdAt'])

export function diffRows(before: Row | null, after: Row | null) {
  const changes: Record<string, { from: unknown; to: unknown }> = {}
  if (!before || !after) return changes
  for (const field of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (IGNORED_DIFF_FIELDS.has(field)) continue
    const from = before[field]
    const to = after[field]
    if (JSON.stringify(from) !== JSON.stringify(to)) changes[field] = { from, to }
  }
  return changes
}

const LABEL_FIELDS = ['title', 'name', 'subject', 'key', 'slug', 'email', 'filename', 'label']

export function rowLabel(row: Row | null): string | null {
  if (!row) return null
  for (const field of LABEL_FIELDS) {
    const value = row[field]
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 80)
  }
  if (typeof row.page === 'string' && typeof row.section === 'string')
    return `${row.page} › ${row.section}${typeof row.fieldKey === 'string' ? ` › ${row.fieldKey}` : ''}`
  return null
}

/** Splits "BlogPost" into "blog post" for summaries people read. */
export function humanModel(model: string) {
  return model.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
}

const VERBS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  bulk_update: 'Updated',
  bulk_delete: 'Deleted',
}

export function summarize(action: string, model: string, label: string | null, count?: number) {
  const verb = VERBS[action] ?? action
  if (count !== undefined) return `${verb} ${count} ${humanModel(model)} record${count === 1 ? '' : 's'}`
  return label ? `${verb} ${humanModel(model)} “${label}”` : `${verb} ${humanModel(model)}`
}

export type AuditEntry = {
  actorEmail: string
  action: string
  entity: string
  entityId?: string | null
  summary: string
  changes?: Prisma.InputJsonValue
  ip?: string | null
}

export function clientIp(forwardedFor: string | null, realIp: string | null) {
  // Traefik appends the client address last; earlier entries can be forged.
  const forwarded = forwardedFor?.split(',').map((part) => part.trim()).filter(Boolean)
  return (forwarded?.at(-1) || realIp || '').slice(0, 64) || null
}
