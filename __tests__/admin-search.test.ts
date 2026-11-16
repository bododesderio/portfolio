import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('../lib/auth', () => ({ auth: vi.fn() }))
vi.mock('../lib/data/db', () => ({
  prisma: Object.fromEntries(
    ['blogPost', 'project', 'media', 'message', 'subscriber', 'client'].map(
      (name) => [name, { findMany: vi.fn() }]
    )
  ),
}))
import { auth } from '../lib/auth'
import { prisma } from '../lib/data/db'
import { GET } from '../app/api/admin/search/route'
const models = [
  prisma.blogPost,
  prisma.project,
  prisma.media,
  prisma.message,
  prisma.subscriber,
  prisma.client,
]
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({
    user: { id: '1', email: 'admin@example.invalid' },
  } as never)
  for (const model of models) vi.mocked(model.findMany).mockResolvedValue([])
})
const request = (query: string) =>
  new NextRequest(
    `http://localhost/api/admin/search?q=${encodeURIComponent(query)}`
  )
describe('workspace search', () => {
  it('rejects malformed sessions before reading private records', async () => {
    vi.mocked(auth).mockResolvedValue({
      message: 'Configuration error',
    } as never)
    expect((await GET(request('private'))).status).toBe(401)
    for (const model of models) expect(model.findMany).not.toHaveBeenCalled()
  })
  it('does not query for a single character', async () => {
    expect(await (await GET(request(' x '))).json()).toEqual([])
    for (const model of models) expect(model.findMany).not.toHaveBeenCalled()
  })
  it('makes hidden work editable through authenticated search and bounds large input', async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { id: 'internal', title: 'Private work', visible: false },
    ] as never)
    const response = await GET(request('x'.repeat(300)))
    expect(await response.json()).toContainEqual({
      type: 'project',
      id: 'internal',
      title: 'Private work',
      href: '/admin/projects/internal',
      subtitle: 'Hidden work',
    })
    const options = vi.mocked(prisma.project.findMany).mock.calls[0][0]
    expect(JSON.stringify(options?.where)).not.toContain('visible')
    expect(
      (options?.where?.OR?.[0]?.title as { contains: string }).contains
    ).toHaveLength(120)
    expect(options?.take).toBe(5)
  })
  it('reports unavailable search instead of pretending there are no matches', async () => {
    vi.mocked(prisma.project.findMany).mockRejectedValue(
      new Error('database unavailable')
    )
    expect((await GET(request('Rooibok'))).status).toBe(503)
  })
})
