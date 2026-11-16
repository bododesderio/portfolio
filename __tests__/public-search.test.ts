import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('../lib/data/db', () => ({
  prisma: {
    blogPost: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    siteContent: { findMany: vi.fn() },
  },
}))
import { prisma } from '../lib/data/db'
import {
  normalizeSearchQuery,
  searchPublicContent,
} from '../lib/data/public-search'
const posts = vi.mocked(prisma.blogPost.findMany)
const projects = vi.mocked(prisma.project.findMany)
const content = vi.mocked(prisma.siteContent.findMany)
beforeEach(() => {
  vi.clearAllMocks()
  posts.mockResolvedValue([])
  projects.mockResolvedValue([])
  content.mockResolvedValue([])
})
describe('public archive search', () => {
  it('does not query the database for empty or one-character input', async () => {
    expect(await searchPublicContent(' a ')).toEqual([])
    expect(posts).not.toHaveBeenCalled()
    expect(projects).not.toHaveBeenCalled()
    expect(content).not.toHaveBeenCalled()
  })
  it('bounds and normalizes the query', () => {
    expect(normalizeSearchQuery('  Kampala  \n Uganda ')).toBe('Kampala Uganda')
    expect(normalizeSearchQuery('x'.repeat(500))).toHaveLength(120)
  })
  it('restricts results to published writing, visible work, and curated public biography fields', async () => {
    await searchPublicContent('Rooibok')
    expect(posts.mock.calls[0][0]?.where).toMatchObject({ status: 'published' })
    expect(projects.mock.calls[0][0]?.where).toMatchObject({ visible: true })
    const where = content.mock.calls[0][0]?.where
    expect(where).toMatchObject({
      OR: expect.arrayContaining([
        { page: 'home', section: 'bio', fieldKey: 'body' },
      ]),
    })
    expect(JSON.stringify(where)).not.toContain('settings')
    expect(posts.mock.calls[0][0]?.take).toBeLessThanOrEqual(6)
    expect(projects.mock.calls[0][0]?.take).toBeLessThanOrEqual(6)
  })
  it('returns useful history matches without exposing the stored JSON', async () => {
    content.mockResolvedValue([
      {
        page: 'about',
        section: 'story',
        fieldKey: 'items',
        value: JSON.stringify([
          {
            year: '2023',
            title: 'Community leadership',
            organization: 'African Youth Congress',
            description: 'Working with young people in Uganda.',
          },
        ]),
      },
    ] as never)
    const results = await searchPublicContent('community')
    expect(results).toContainEqual({
      title: '2023 · Community leadership',
      excerpt: 'Working with young people in Uganda.',
      href: '/about#timeline',
      kind: 'Biography',
    })
  })
  it('removes HTML from previews and keeps public destinations distinct', async () => {
    posts.mockResolvedValue([
      {
        title: 'Kampala notes',
        slug: 'kampala-notes',
        excerpt: '<p>Thoughts &amp; ideas</p>',
        body: '<p>In Kampala</p>',
      },
    ] as never)
    projects.mockResolvedValue([
      {
        title: 'Kampala project',
        slug: 'kampala-project',
        excerpt: 'Software',
        body: '<p>A project</p>',
      },
    ] as never)
    const results = await searchPublicContent('Kampala')
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/blog/kampala-notes',
          excerpt: 'Thoughts & ideas In Kampala',
        }),
        expect.objectContaining({
          href: '/projects/kampala-project',
          kind: 'Work',
        }),
      ])
    )
  })
})

describe('CV additions in public search', () => {
  it('returns education qualifications as readable records with a section link', async () => {
    content.mockResolvedValue([
      {
        page: 'about',
        section: 'education',
        fieldKey: 'items',
        value: JSON.stringify([
          {
            title: 'Certificate in Professional Foundations',
            organization: 'ALX',
            description: 'Professional foundations certification.',
          },
        ]),
      },
    ] as never)
    const results = await searchPublicContent('ALX')
    expect(results).toContainEqual({
      title: 'Certificate in Professional Foundations',
      excerpt: 'ALX · Professional foundations certification.',
      href: '/about#education',
      kind: 'Biography',
    })
    expect(JSON.stringify(results)).not.toContain('fieldKey')
  })
  it('formats language records without exposing their stored JSON', async () => {
    content.mockResolvedValue([
      {
        page: 'about',
        section: 'languages',
        fieldKey: 'items',
        value: JSON.stringify([
          { title: 'Lango', description: 'Native' },
          { title: 'English', description: 'Expert' },
        ]),
      },
    ] as never)
    const results = await searchPublicContent('Lango')
    expect(results).toContainEqual(
      expect.objectContaining({
        title: 'Skills & languages',
        excerpt: 'Lango: Native · English: Expert',
        href: '/about#skills',
      })
    )
  })
})
