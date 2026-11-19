import { createHash } from 'node:crypto'
import { basePrisma } from '@/lib/data/db'
import { notifyAdmin } from '@/lib/domain/admin-notifications'

export const ERROR_SOURCES = ['public', 'admin', 'server'] as const
export type ErrorSource = (typeof ERROR_SOURCES)[number]
export const ERROR_STATUSES = ['open', 'resolved', 'ignored'] as const
export type ErrorStatus = (typeof ERROR_STATUSES)[number]

/** Stops a flood of distinct junk errors from filling the table. */
const MAX_OPEN_REPORTS = 500

/** Errors a visitor's own browser causes, which nothing in this codebase can fix. */
const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /(chrome|moz|safari)-extension:\/\//i,
  /Non-Error promise rejection captured/i,
]

export function isNoise(message: string, stack?: string | null) {
  return NOISE.some((pattern) => pattern.test(message) || (stack ? pattern.test(stack) : false))
}

/**
 * Groups repeats of one bug: digits and hex ids in the message vary per request,
 * and only the first stack frame identifies where it was thrown.
 */
export function fingerprintError(source: ErrorSource, message: string, stack?: string | null) {
  const stableMessage = message.replace(/[0-9a-f]{8,}/gi, '#').replace(/\d+/g, '#')
  const firstFrame =
    stack
      ?.split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('at ') || line.includes('@'))
      ?.replace(/:\d+:\d+\)?$/, '') ?? ''
  return createHash('sha256').update(`${source}\n${stableMessage}\n${firstFrame}`).digest('hex')
}

export async function recordError(report: {
  source: ErrorSource
  message: string
  stack?: string | null
  path?: string | null
  userAgent?: string | null
}) {
  const message = report.message.trim().slice(0, 1000) || 'Unknown error'
  if (isNoise(message, report.stack)) return
  const fingerprint = fingerprintError(report.source, message, report.stack)
  try {
    const existing = await basePrisma.errorReport.findUnique({ where: { fingerprint } })
    if (existing) {
      const reopened = existing.status === 'resolved'
      await basePrisma.errorReport.update({
        where: { fingerprint },
        data: {
          count: { increment: 1 },
          lastSeenAt: new Date(),
          path: report.path?.slice(0, 300) ?? existing.path,
          ...(reopened ? { status: 'open' } : {}),
        },
      })
      if (reopened)
        await notifyAdmin({
          type: 'error',
          title: 'A resolved error came back',
          body: message.slice(0, 200),
          href: `/admin/system/errors?id=${existing.id}`,
        })
      return
    }
    const open = await basePrisma.errorReport.count({ where: { status: 'open' } })
    if (open >= MAX_OPEN_REPORTS) return
    const created = await basePrisma.errorReport.create({
      data: {
        fingerprint,
        source: report.source,
        message,
        stack: report.stack?.slice(0, 8000),
        path: report.path?.slice(0, 300),
        userAgent: report.userAgent?.slice(0, 300),
      },
    })
    await notifyAdmin({
      type: 'error',
      title: `New ${report.source} error`,
      body: message.slice(0, 200),
      href: `/admin/system/errors?id=${created.id}`,
    })
  } catch (error) {
    // The fingerprint is unique, so two simultaneous first reports race; the loser lands here.
    console.error('[errors] could not record report', error)
  }
}
