import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('../lib/auth', () => ({ auth: (handler: unknown) => handler }))
vi.mock('../lib/domain/maintenance', async (original) => ({
  ...(await original<typeof import('../lib/domain/maintenance')>()),
  getMaintenanceState: async () => ({ enabled: true, message: 'Back soon', returnAt: null }),
}))
import proxy from '../proxy'

type Session = { user: { id: string; email: string } } | null
const handle = proxy as unknown as (request: NextRequest & { auth: Session }) => Promise<Response>
const admin = { user: { id: '1', email: 'owner@example.test' } }
function request(path: string, auth: Session = null, headers: Record<string, string> = {}) {
  return Object.assign(
    new NextRequest(`http://localhost${path}`, { headers: { 'user-agent': 'Mozilla/5.0', ...headers } }),
    { auth }
  )
}

describe('maintenance mode in the proxy', () => {
  it('serves visitors the maintenance page with 503 and a retry hint', async () => {
    const res = await handle(request('/about'))
    expect(res.status).toBe(503)
    expect(res.headers.get('retry-after')).toBe('1800')
    expect(res.headers.get('x-middleware-rewrite')).toContain('/maintenance')
  })
  it('lets the signed-in owner through and flags the preview notice', async () => {
    const res = await handle(request('/about', admin))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-request-x-maintenance-preview')).toBe('1')
  })
  it('ignores a visitor-supplied preview header', async () => {
    const res = await handle(request('/about', null, { 'x-maintenance-preview': '1' }))
    expect(res.status).toBe(503)
  })
  it('keeps sign-in reachable', async () => {
    const res = await handle(request('/admin/login'))
    expect(res.status).toBe(200)
  })
})
