import { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { z } from 'zod'
import { auth } from '@/lib/auth'

/**
 * Wraps an admin route handler so the auth guard cannot be forgotten, and folds
 * the repeated zod-parse + try/catch boilerplate into one place.
 *
 * Behaviour it standardises (identical to what every handler did by hand):
 *   - no session            → 401 { error: 'Unauthorized' }
 *   - schema parse fails     → 400 { error: <first zod issue> }
 *   - handler throws         → 500 { error: opts.onError ?? 'Request failed.' }
 *
 * The handler receives the parsed body (when a schema is given), the resolved
 * route params, the raw request, and the guaranteed-non-null session. It returns
 * a NextResponse directly, so custom status codes and payloads are preserved.
 *
 * formData/upload routes pass no schema and read `req.formData()` themselves;
 * they still get the auth guard and the 500 safety net.
 */

// Next's generated route validator compares this against each route's own
// context type (static → `Promise<{}>`, dynamic → `Promise<{ id: string }>`).
// A single generic wrapper can't name every shape, so `Promise<any>` at the
// framework boundary satisfies the check both ways; params are narrowed to
// Record<string, string> before the handler sees them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> }

interface HandlerArgs<T> {
  req: NextRequest
  params: Record<string, string>
  data: T
  session: Session
}

type Handler<T> = (args: HandlerArgs<T>) => Promise<NextResponse> | NextResponse

interface Options<S extends z.ZodTypeAny> {
  /** When set, the JSON body is parsed with this schema and passed as `data`. */
  schema?: S
  /** Message for the 500 fallback. Match the route's previous wording. */
  onError?: string
}

export function withAdmin<S extends z.ZodTypeAny = z.ZodNever>(
  handler: Handler<S extends z.ZodNever ? undefined : z.infer<S>>,
  opts: Options<S> = {},
) {
  return async (req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const data = opts.schema ? opts.schema.parse(await req.json()) : undefined
      const params: Record<string, string> = context ? await context.params : {}
      return await handler({
        req,
        params,
        data: data as S extends z.ZodNever ? undefined : z.infer<S>,
        session,
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: err.issues[0]?.message ?? 'Invalid input.' },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: opts.onError ?? 'Request failed.' }, { status: 500 })
    }
  }
}
