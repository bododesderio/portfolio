import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Contact form schema (mirrors app/api/contact/route.ts)
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

// Newsletter subscribe schema (mirrors app/api/newsletter/subscribe/route.ts)
const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

describe('Contact form validation', () => {
  it('accepts valid input', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a test message with enough length.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({
      name: '',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a test message.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      subject: 'Hello',
      message: 'This is a test message.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short message (< 10 chars)', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hi',
      message: 'Short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = contactSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('Newsletter subscribe validation', () => {
  it('accepts email only', () => {
    const result = subscribeSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('accepts email with name', () => {
    const result = subscribeSchema.safeParse({ email: 'user@example.com', name: 'Jane' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = subscribeSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('rejects missing email', () => {
    const result = subscribeSchema.safeParse({ name: 'Jane' })
    expect(result.success).toBe(false)
  })
})
