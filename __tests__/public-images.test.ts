import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('../lib/auth', () => ({ auth: (handler: unknown) => handler }))
import proxy from '../proxy'
const handle = proxy as unknown as (request: NextRequest & { auth: null }) => Promise<Response>
function request(path: string, userAgent = '') {
  return Object.assign(new NextRequest(`http://localhost${path}`, { headers: { 'user-agent': userAgent } }), { auth: null })
}
describe('public image requests from the optimizer', () => {
  it.each(['/images/gallery/tt.JPG', '/images/gallery/IMG_2496.JPG', '/uploads/portrait.PNG'])('allows public image %s without a user agent', async path => {
    expect((await handle(request(path))).status).toBe(200)
  })
  it('retains admin protection when the path happens to end in an image extension', async () => {
    expect((await handle(request('/api/admin/private.JPG', 'Browser audit'))).status).toBe(401)
    expect((await handle(request('/admin/settings/photo.JPG', 'Browser audit'))).status).toBe(307)
  })
  it('does not exempt other content under public image directories', async () => {
    expect((await handle(request('/images/private.html'))).status).toBe(403)
  })
})
