import Redis from 'ioredis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.REDIS_URL
    if (!url) throw new Error('REDIS_URL is not set')
    _redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 })
  }
  return _redis
}

/**
 * What to do when Redis itself is unavailable.
 *
 *  'open'   — allow the request. Correct for analytics, where dropping traffic
 *             is worse than over-counting.
 *  'closed' — reject the request. Correct wherever a request causes outbound
 *             email: a Redis blip would otherwise open a mail-relay abuse
 *             window and burn the sending domain's reputation.
 */
export type RateLimitFailureMode = 'open' | 'closed'

export interface RateLimitOptions {
  limit: number
  windowMs: number
  onError?: RateLimitFailureMode
}

/** Redis sliding-window rate limiter. */
export async function rateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<{ ok: boolean; remaining: number }> {
  const now = Date.now()
  const windowStart = now - opts.windowMs
  const redisKey = `rl:${key}`
  // Unique member so the undo below removes exactly this request's entry. The
  // previous implementation removed by score, deleting every entry sharing the
  // same millisecond — including other callers' requests.
  const member = `${now}-${Math.random()}`

  try {
    const redis = getRedis()
    const pipe = redis.pipeline()
    pipe.zremrangebyscore(redisKey, '-inf', windowStart)
    pipe.zadd(redisKey, now, member)
    pipe.zcard(redisKey)
    pipe.pexpire(redisKey, opts.windowMs)
    const results = await pipe.exec()

    const count = (results?.[2]?.[1] as number) ?? 0
    if (count > opts.limit) {
      await redis.zrem(redisKey, member)
      return { ok: false, remaining: 0 }
    }
    return { ok: true, remaining: opts.limit - count }
  } catch (err) {
    const mode = opts.onError ?? 'open'
    console.warn(
      `[RateLimit] Redis unavailable for "${key}", failing ${mode}:`,
      (err as Error).message,
    )
    return { ok: mode === 'open', remaining: 0 }
  }
}

/**
 * Number of reverse proxies in front of the app.
 *
 * X-Forwarded-For is client-controlled: a request can arrive already carrying
 * a forged header, and each proxy appends to it. Reading the leftmost value
 * therefore reads whatever the client claimed. Counting back from the right
 * yields the address observed by our own outermost proxy, which a client
 * cannot influence.
 *
 * Set TRUSTED_PROXY_HOPS to match the deployment: 1 behind a single nginx or
 * Caddy, 2 behind Cloudflare plus nginx.
 */
function trustedProxyHops(): number {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS ?? '1')
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1
}

export function getClientIp(request: Request): string {
  // Set by Cloudflare itself and not forwardable by the client.
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const chain = forwarded.split(',').map((p) => p.trim()).filter(Boolean)
    if (chain.length > 0) {
      const index = chain.length - trustedProxyHops()
      return chain[Math.max(0, index)]
    }
  }

  return request.headers.get('x-real-ip')?.trim() ?? 'unknown'
}
