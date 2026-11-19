import { Prisma, PrismaClient } from '@prisma/client'
import {
  UNAUDITED_MODELS,
  clientIp,
  diffRows,
  redactRow,
  rowLabel,
  summarize,
  type AuditEntry,
} from '@/lib/domain/audit'

const globalForPrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined
}

/** Unextended client: used to write audit rows so logging never logs itself. */
export const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.basePrisma = basePrisma

type Delegate = {
  findUnique: (args: { where: unknown }) => Promise<unknown>
}

function delegateFor(model: string): Delegate | null {
  const key = model.charAt(0).toLowerCase() + model.slice(1)
  const delegate = (basePrisma as unknown as Record<string, Delegate | undefined>)[key]
  return delegate && typeof delegate.findUnique === 'function' ? delegate : null
}

/**
 * The signed-in admin behind the current request, or null for visitors, the
 * seed, and anything running outside a request (where auth() throws).
 */
async function currentActor(): Promise<{ email: string; ip: string | null } | null> {
  try {
    const [{ auth }, { headers }, { isAdminSession }] = await Promise.all([
      import('@/lib/auth'),
      import('next/headers'),
      import('@/lib/util/admin-session'),
    ])
    const session = await auth()
    if (!isAdminSession(session)) return null
    const requestHeaders = await headers()
    return {
      email: session.user.email,
      ip: clientIp(requestHeaders.get('x-forwarded-for'), requestHeaders.get('x-real-ip')),
    }
  } catch {
    return null
  }
}

export async function recordAudit(entry: AuditEntry) {
  try {
    await basePrisma.auditLog.create({ data: entry })
  } catch (error) {
    console.error('[audit] could not record entry', entry.summary, error)
  }
}

const idOf = (row: unknown) =>
  row && typeof row === 'object' && 'id' in row && typeof row.id === 'string'
    ? row.id
    : row && typeof row === 'object' && 'key' in row && typeof row.key === 'string'
      ? row.key
      : null

const audited = basePrisma.$extends({
  name: 'audit-trail',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const writes = ['create', 'update', 'upsert', 'delete', 'updateMany', 'deleteMany', 'createMany']
        if (!writes.includes(operation) || UNAUDITED_MODELS.has(model)) return query(args)
        const actor = await currentActor()
        if (!actor) return query(args)

        const delegate = delegateFor(model)
        const where = (args as { where?: unknown }).where
        const before =
          delegate && where && ['update', 'upsert', 'delete'].includes(operation)
            ? redactRow(model, await delegate.findUnique({ where }).catch(() => null))
            : null

        const result = await query(args)

        try {
          if (operation === 'updateMany' || operation === 'deleteMany' || operation === 'createMany') {
            const count = (result as { count?: number }).count ?? 0
            if (count === 0) return result
            const action =
              operation === 'deleteMany' ? 'bulk_delete' : operation === 'createMany' ? 'create' : 'bulk_update'
            await recordAudit({
              actorEmail: actor.email,
              action,
              entity: model,
              summary: summarize(action, model, null, count),
              changes: { where: JSON.parse(JSON.stringify(where ?? {})) } as Prisma.InputJsonValue,
              ip: actor.ip,
            })
            return result
          }
          const after = operation === 'delete' ? null : redactRow(model, result)
          const action = operation === 'upsert' ? (before ? 'update' : 'create') : operation
          const changes =
            action === 'update' ? diffRows(before, after) : action === 'create' ? after : before
          if (action === 'update' && Object.keys(changes ?? {}).length === 0) return result
          await recordAudit({
            actorEmail: actor.email,
            action,
            entity: model,
            entityId: idOf(result) ?? idOf(before),
            summary: summarize(action, model, rowLabel(after ?? before)),
            changes: (changes ?? undefined) as Prisma.InputJsonValue | undefined,
            ip: actor.ip,
          })
        } catch (error) {
          console.error('[audit] could not describe change', model, operation, error)
        }
        return result
      },
    },
  },
})

export const prisma = audited
