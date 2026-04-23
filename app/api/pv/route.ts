import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { getSiteSetting } from '@/lib/content'

const schema = z.object({
  path: z.string().min(1).max(512),
  referrer: z.string().max(1024).nullable().optional(),
  sessionId: z.string().min(8).max(64),
})

// Very small in-memory token bucket per session — OK for a single-node Next deployment.
// For multi-node, replace with Upstash or Redis.
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 10
const buckets = new Map<string, number[]>()

function overRate(sessionId: string): boolean {
  const now = Date.now()
  const arr = (buckets.get(sessionId) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_MAX) {
    buckets.set(sessionId, arr)
    return true
  }
  arr.push(now)
  buckets.set(sessionId, arr)
  return false
}

function hashUA(ua: string | null): string | null {
  if (!ua) return null
  const salt = process.env.ANALYTICS_SALT ?? ''
  return createHash('sha256').update(ua + salt).digest('hex').slice(0, 32)
}

export async function POST(req: NextRequest) {
  // Respect DNT header too.
  if (req.headers.get('dnt') === '1') return NextResponse.json({ ok: true, skipped: 'dnt' })

  // Global kill switch.
  const enabled = (await getSiteSetting('admin.analytics_enabled')) !== 'false'
  if (!enabled) return NextResponse.json({ ok: true, skipped: 'disabled' })

  try {
    const body = await req.json()
    const { path, referrer, sessionId } = schema.parse(body)

    // Skip admin paths even if the client sent one.
    if (path.startsWith('/admin')) return NextResponse.json({ ok: true, skipped: 'admin' })
    // Skip analytics endpoint itself.
    if (path === '/api/pv') return NextResponse.json({ ok: true, skipped: 'self' })

    if (overRate(sessionId)) return NextResponse.json({ ok: true, skipped: 'rate' })

    await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        sessionId,
        userAgentHash: hashUA(req.headers.get('user-agent')),
        country: req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
