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
 * Redis sliding-window rate limiter.
 * Falls back to allowing the request if Redis is unavailable (fail-open).
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<{ ok: boolean; remaining: number }> {
  const now = Date.now()
  const windowStart = now - opts.windowMs
  const redisKey = `rl:${key}`

  try {
    const redis = getRedis()
    const pipe = redis.pipeline()
    pipe.zremrangebyscore(redisKey, '-inf', windowStart)
    pipe.zadd(redisKey, now, `${now}-${Math.random()}`)
    pipe.zcard(redisKey)
    pipe.pexpire(redisKey, opts.windowMs)
    const results = await pipe.exec()

    const count = (results?.[2]?.[1] as number) ?? 0
    if (count > opts.limit) {
      // Undo the zadd — we're over limit
      await redis.zremrangebyscore(redisKey, now, now)
      return { ok: false, remaining: 0 }
    }
    return { ok: true, remaining: opts.limit - count }
  } catch (err) {
    // Redis unavailable — fail open but log it
    console.warn('[RateLimit] Redis unavailable, failing open:', (err as Error).message)
    return { ok: true, remaining: opts.limit }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
