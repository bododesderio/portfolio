import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Tests the Projects API validation schema.
 * Mirrors the Zod schema from app/api/admin/projects/route.ts
 */

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  order: z.number().int().default(0),
})

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string(),
  body: z.string(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed']).default('planned'),
  category: z.string().optional().nullable(),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  ongoing: z.boolean().default(false),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  images: z.array(imageSchema).default([]),
})

const projectUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed']).optional(),
  category: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional(),
  liveUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  ongoing: z.boolean().optional(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  images: z.array(imageSchema).optional(),
})

describe('Project create validation', () => {
  const validProject = {
    title: 'My Project',
    slug: 'my-project',
    excerpt: 'A short description',
    body: '<p>Full project description</p>',
    status: 'in_progress' as const,
    techStack: ['Next.js', 'TypeScript'],
  }

  it('accepts valid project', () => {
    const result = projectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = projectSchema.safeParse({ ...validProject, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty slug', () => {
    const result = projectSchema.safeParse({ ...validProject, slug: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing title and slug', () => {
    const result = projectSchema.safeParse({ excerpt: 'test', body: 'test' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = projectSchema.safeParse({ ...validProject, status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('accepts all three valid statuses', () => {
    for (const status of ['planned', 'in_progress', 'completed']) {
      const result = projectSchema.safeParse({ ...validProject, status })
      expect(result.success).toBe(true)
    }
  })

  it('defaults status to planned', () => {
    const noStatus = { ...validProject }
    delete (noStatus as Partial<typeof validProject>).status
    const result = projectSchema.safeParse(noStatus)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('planned')
  })

  it('defaults techStack to empty array', () => {
    const noTech = { ...validProject }
    delete (noTech as Partial<typeof validProject>).techStack
    const result = projectSchema.safeParse(noTech)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.techStack).toEqual([])
  })

  it('accepts images array', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      images: [
        { url: '/uploads/img.jpg', alt: 'Screenshot', order: 0 },
        { url: '/uploads/img2.jpg', order: 1 },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.images).toHaveLength(2)
  })

  it('rejects images with empty URL', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      images: [{ url: '', order: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts nullable optional fields', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      featuredImageUrl: null,
      category: null,
      liveUrl: null,
      githubUrl: null,
      startDate: null,
      endDate: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('Project update validation', () => {
  it('accepts partial update', () => {
    const result = projectUpdateSchema.safeParse({ title: 'Updated Title' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no changes)', () => {
    const result = projectUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects empty title when provided', () => {
    const result = projectUpdateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('accepts status change only', () => {
    const result = projectUpdateSchema.safeParse({ status: 'completed' })
    expect(result.success).toBe(true)
  })

  it('accepts visibility toggle', () => {
    const result = projectUpdateSchema.safeParse({ visible: false })
    expect(result.success).toBe(true)
  })
})

describe('Slug format validation', () => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  it('accepts valid slugs', () => {
    expect(slugRegex.test('my-project')).toBe(true)
    expect(slugRegex.test('project-123')).toBe(true)
    expect(slugRegex.test('a')).toBe(true)
    expect(slugRegex.test('hello-world-test')).toBe(true)
  })

  it('rejects invalid slugs', () => {
    expect(slugRegex.test('My Project')).toBe(false)
    expect(slugRegex.test('has spaces')).toBe(false)
    expect(slugRegex.test('UPPERCASE')).toBe(false)
    expect(slugRegex.test('-leading-dash')).toBe(false)
    expect(slugRegex.test('trailing-dash-')).toBe(false)
    expect(slugRegex.test('double--dash')).toBe(false)
    expect(slugRegex.test('')).toBe(false)
  })
})
