import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('../lib/auth', () => ({ auth: (handler: unknown) => handler }))
import proxy from '../proxy'
const handle = proxy as unknown as (request: NextRequest & { auth: null }) => Response
function request(path: string, userAgent = '') {
  return Object.assign(new NextRequest(`http://localhost${path}`, { headers: { 'user-agent': userAgent } }), { auth: null })
}
describe('public image requests from the optimizer', () => {
  it.each(['/images/gallery/tt.JPG', '/images/gallery/IMG_2496.JPG', '/uploads/portrait.PNG'])('allows public image %s without a user agent', path => {
    expect(handle(request(path)).status).toBe(200)
  })
  it('retains admin protection when the path happens to end in an image extension', () => {
    expect(handle(request('/api/admin/private.JPG', 'Browser audit')).status).toBe(401)
    expect(handle(request('/admin/settings/photo.JPG', 'Browser audit')).status).toBe(307)
  })
  it('does not exempt other content under public image directories', () => {
    expect(handle(request('/images/private.html')).status).toBe(403)
  })
})
