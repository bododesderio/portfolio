import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHash } from 'crypto'
import { prisma } from '@/lib/data/db'
import { getSiteSetting } from '@/lib/data/content'
import { getClientIp, rateLimit } from '@/lib/util/rate-limit'

const schema = z.object({
  path: z.string().min(1).max(512),
  referrer: z.string().max(1024).nullable().optional(),
  sessionId: z.string().min(8).max(64),
})

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

    // Rate limit on the client IP first. sessionId comes from the request body,
    // so keying solely on it lets a caller rotate the value and write unbounded
    // page-view rows. The IP cap is generous enough for real multi-tab browsing;
    // the per-session cap still limits a single tab hammering one path.
    const ip = getClientIp(req)
    const [byIp, bySession] = await Promise.all([
      rateLimit(`pv:ip:${ip}`, { limit: 120, windowMs: 60_000 }),
      rateLimit(`pv:sid:${sessionId}`, { limit: 10, windowMs: 60_000 }),
    ])
    if (!byIp.ok || !bySession.ok) return NextResponse.json({ ok: true, skipped: 'rate' })

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
