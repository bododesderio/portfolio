import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Tests the Blog API validation schema.
 * Mirrors the Zod schema from app/api/admin/blog/route.ts
 */

const attributionSchema = z.object({
  photographer: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
}).nullable().optional()

const blogCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  body: z.string(),
  excerpt: z.string(),
  category: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
  featuredImageUrl: z.string().min(1, 'Featured image is required'),
  featuredImageAlt: z.string().min(1, 'Alt text is required'),
  featuredImageAttribution: attributionSchema,
  notifySubscribers: z.boolean().optional(),
})

const blogUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  body: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).optional(),
  featuredImageUrl: z.string().min(1).optional(),
  featuredImageAlt: z.string().min(1).optional(),
  featuredImageAttribution: attributionSchema,
  publishedAt: z.union([z.string(), z.null()]).optional(),
  notifySubscribers: z.boolean().optional(),
})

describe('Blog post create validation', () => {
  const valid = {
    title: 'Test Post',
    slug: 'test-post',
    body: '<p>Content</p>',
    excerpt: 'A test post excerpt',
    featuredImageUrl: '/uploads/hero.jpg',
    featuredImageAlt: 'Hero image description',
  }

  it('accepts valid post', () => {
    expect(blogCreateSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing featured image', () => {
    const { featuredImageUrl, ...noImage } = valid
    expect(blogCreateSchema.safeParse(noImage).success).toBe(false)
  })

  it('rejects empty featured image', () => {
    expect(blogCreateSchema.safeParse({ ...valid, featuredImageUrl: '' }).success).toBe(false)
  })

  it('rejects missing alt text', () => {
    const { featuredImageAlt, ...noAlt } = valid
    expect(blogCreateSchema.safeParse(noAlt).success).toBe(false)
  })

  it('rejects empty alt text', () => {
    expect(blogCreateSchema.safeParse({ ...valid, featuredImageAlt: '' }).success).toBe(false)
  })

  it('rejects missing title', () => {
    expect(blogCreateSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('rejects missing slug', () => {
    expect(blogCreateSchema.safeParse({ ...valid, slug: '' }).success).toBe(false)
  })

  it('rejects invalid status', () => {
    expect(blogCreateSchema.safeParse({ ...valid, status: 'archived' }).success).toBe(false)
  })

  it('defaults status to draft', () => {
    const result = blogCreateSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('draft')
  })

  it('accepts attribution object', () => {
    const result = blogCreateSchema.safeParse({
      ...valid,
      featuredImageAttribution: {
        photographer: 'John Doe',
        source: 'Unsplash',
        source_url: 'https://unsplash.com',
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts null attribution', () => {
    const result = blogCreateSchema.safeParse({ ...valid, featuredImageAttribution: null })
    expect(result.success).toBe(true)
  })

  it('accepts notifySubscribers flag', () => {
    const result = blogCreateSchema.safeParse({ ...valid, status: 'published', notifySubscribers: true })
    expect(result.success).toBe(true)
  })
})

describe('Blog post update validation', () => {
  it('accepts partial update', () => {
    expect(blogUpdateSchema.safeParse({ title: 'New Title' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(blogUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('rejects empty title when provided', () => {
    expect(blogUpdateSchema.safeParse({ title: '' }).success).toBe(false)
  })

  it('accepts status change to published', () => {
    expect(blogUpdateSchema.safeParse({ status: 'published' }).success).toBe(true)
  })

  it('accepts null publishedAt (revert to draft)', () => {
    expect(blogUpdateSchema.safeParse({ publishedAt: null, status: 'draft' }).success).toBe(true)
  })
})
