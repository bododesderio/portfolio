import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/util/rate-limit'
import { recordError } from '@/lib/domain/error-reports'

const MAX_BODY_BYTES = 16_000

const schema = z.object({
  message: z.string().min(1).max(1000),
  stack: z.string().max(8000).optional(),
  path: z.string().max(300).optional(),
})

export async function POST(req: NextRequest) {
  const declaredSize = Number(req.headers.get('content-length') || 0)
  if (declaredSize > MAX_BODY_BYTES)
    return NextResponse.json({ error: 'Report too large.' }, { status: 413 })

  // Closed on Redis failure: losing a few reports is better than an unthrottled write endpoint.
  const { ok } = await rateLimit(`errors:${getClientIp(req)}`, {
    limit: 20,
    windowMs: 10 * 60_000,
    onError: 'closed',
  })
  if (!ok) return new NextResponse(null, { status: 429 })

  const text = await req.text()
  if (text.length > MAX_BODY_BYTES)
    return NextResponse.json({ error: 'Report too large.' }, { status: 413 })
  let parsed: z.infer<typeof schema>
  try {
    parsed = schema.parse(JSON.parse(text))
  } catch {
    return NextResponse.json({ error: 'Invalid report.' }, { status: 400 })
  }

  // The source comes from the page path, never from the caller's claim.
  const path = parsed.path?.startsWith('/') ? parsed.path : undefined
  await recordError({
    source: path?.startsWith('/admin') ? 'admin' : 'public',
    message: parsed.message,
    stack: parsed.stack,
    path,
    userAgent: req.headers.get('user-agent'),
  })
  return new NextResponse(null, { status: 204 })
}
