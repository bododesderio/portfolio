import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminSession } from '../lib/util/admin-session'
vi.mock('../lib/auth', () => ({ auth: vi.fn() }))
vi.mock('../lib/config', () => ({ getAllConfig: vi.fn(), setConfig: vi.fn(), clearConfigCache: vi.fn(), CONFIG_KEYS: {} }))
vi.mock('../lib/domain/mailer', () => ({ resetTransporter: vi.fn() }))
import { auth } from '../lib/auth'
import { getAllConfig } from '../lib/config'
import { withAdmin } from '../lib/util/with-admin'
import { GET as configGET } from '../app/api/admin/config/route'
const mockAuth = vi.mocked(auth)
beforeEach(() => vi.clearAllMocks())
describe('admin session validation', () => {
  it.each([null, {}, { message: 'Server configuration error' }, { user: null }, { user: {} }, { user: { email: 'admin@example.com' } }, { user: { id: '1', email: '' } }, { user: { id: '', email: 'admin@example.com' } }])('rejects malformed identity %j', value => {
    expect(isAdminSession(value)).toBe(false)
  })
  it('accepts the identity issued by the single-admin credentials provider', () => {
    expect(isAdminSession({ user: { id: '1', email: 'admin@example.com' } })).toBe(true)
  })
  it('prevents a configuration-error object from reaching a shared admin handler', async () => {
    mockAuth.mockResolvedValue({ message: 'Server configuration error' } as never)
    const handler = vi.fn(() => NextResponse.json({ ok: true }))
    const response = await withAdmin(handler)(new NextRequest('http://localhost/api/admin/test'), { params: Promise.resolve({}) })
    expect(response.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })
  it('does not read secrets for an error-shaped session at the inline config endpoint', async () => {
    mockAuth.mockResolvedValue({ message: 'Server configuration error' } as never)
    const response = await configGET()
    expect(response.status).toBe(401)
    expect(getAllConfig).not.toHaveBeenCalled()
  })
  it('keeps authenticated shared admin handlers usable', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', email: 'admin@example.com' } } as never)
    const handler = vi.fn(() => NextResponse.json({ ok: true }))
    const response = await withAdmin(handler)(new NextRequest('http://localhost/api/admin/test'), { params: Promise.resolve({}) })
    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalledOnce()
  })
})
