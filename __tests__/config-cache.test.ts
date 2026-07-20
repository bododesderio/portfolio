import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before importing config
vi.mock('../lib/data/db', () => ({
  prisma: {
    appConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

import { getConfig, setConfig, clearConfigCache } from '../lib/config'
import { prisma } from '../lib/data/db'

const mockFindUnique = vi.mocked(prisma.appConfig.findUnique)
const mockUpsert = vi.mocked(prisma.appConfig.upsert)

describe('Config cache with TTL', () => {
  beforeEach(() => {
    clearConfigCache()
    vi.clearAllMocks()
    // Clear env vars used in fallback
    delete process.env.TEST_KEY
  })

  it('fetches from DB on first call', async () => {
    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'smtp.test.com' } as never)
    const result = await getConfig('SMTP_HOST')
    expect(result).toBe('smtp.test.com')
    expect(mockFindUnique).toHaveBeenCalledOnce()
  })

  it('returns cached value on second call within TTL', async () => {
    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'smtp.test.com' } as never)

    await getConfig('SMTP_HOST')
    await getConfig('SMTP_HOST')

    // DB should only be called once — second call hits cache
    expect(mockFindUnique).toHaveBeenCalledOnce()
  })

  it('re-fetches from DB after TTL expires', async () => {
    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'smtp.test.com' } as never)

    await getConfig('SMTP_HOST')

    // Fast-forward past TTL (5 minutes)
    vi.useFakeTimers()
    vi.advanceTimersByTime(6 * 60 * 1000)

    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'smtp.new.com' } as never)
    const result = await getConfig('SMTP_HOST')

    expect(result).toBe('smtp.new.com')
    expect(mockFindUnique).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })

  it('falls back to env when DB is unreachable', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'))
    process.env.SMTP_HOST = 'env-fallback.com'

    const result = await getConfig('SMTP_HOST')
    expect(result).toBe('env-fallback.com')

    delete process.env.SMTP_HOST
  })

  it('returns empty string when neither DB nor env has value', async () => {
    mockFindUnique.mockResolvedValue(null as never)
    const result = await getConfig('NONEXISTENT_KEY')
    expect(result).toBe('')
  })

  it('updates cache on setConfig', async () => {
    mockUpsert.mockResolvedValue({ key: 'SMTP_HOST', value: 'new.host.com' } as never)

    await setConfig('SMTP_HOST', 'new.host.com')

    // Next getConfig should use cache, not DB
    const result = await getConfig('SMTP_HOST')
    expect(result).toBe('new.host.com')
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('clearConfigCache forces re-fetch', async () => {
    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'first' } as never)
    await getConfig('SMTP_HOST')

    clearConfigCache()

    mockFindUnique.mockResolvedValue({ key: 'SMTP_HOST', value: 'second' } as never)
    const result = await getConfig('SMTP_HOST')

    expect(result).toBe('second')
    expect(mockFindUnique).toHaveBeenCalledTimes(2)
  })
})
