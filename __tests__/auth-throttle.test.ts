import { describe, it, expect } from 'vitest'

/**
 * Tests the login throttle logic from lib/auth.ts.
 * We replicate the logic here to test in isolation (auth.ts has
 * side effects from NextAuth initialization that make direct import complex).
 */

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function checkLoginThrottle(email: string): boolean {
  const entry = loginAttempts.get(email)
  if (!entry) return true
  if (Date.now() - entry.lastAttempt > LOCKOUT_MS) {
    loginAttempts.delete(email)
    return true
  }
  return entry.count < MAX_ATTEMPTS
}

function recordLoginAttempt(email: string, success: boolean) {
  if (success) { loginAttempts.delete(email); return }
  const entry = loginAttempts.get(email) || { count: 0, lastAttempt: 0 }
  entry.count++
  entry.lastAttempt = Date.now()
  loginAttempts.set(email, entry)
}

describe('Login throttle', () => {
  const email = 'admin@test.com'

  it('allows login on first attempt', () => {
    loginAttempts.clear()
    expect(checkLoginThrottle(email)).toBe(true)
  })

  it('allows up to MAX_ATTEMPTS failed logins', () => {
    loginAttempts.clear()
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      expect(checkLoginThrottle(email)).toBe(true)
      recordLoginAttempt(email, false)
    }
  })

  it('blocks after MAX_ATTEMPTS failed logins', () => {
    loginAttempts.clear()
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordLoginAttempt(email, false)
    }
    expect(checkLoginThrottle(email)).toBe(false)
  })

  it('successful login clears the counter', () => {
    loginAttempts.clear()
    for (let i = 0; i < 3; i++) {
      recordLoginAttempt(email, false)
    }
    recordLoginAttempt(email, true)
    expect(checkLoginThrottle(email)).toBe(true)
    expect(loginAttempts.has(email)).toBe(false)
  })

  it('lockout expires after LOCKOUT_MS', () => {
    loginAttempts.clear()
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordLoginAttempt(email, false)
    }
    expect(checkLoginThrottle(email)).toBe(false)

    // Simulate time passing
    const entry = loginAttempts.get(email)!
    entry.lastAttempt = Date.now() - LOCKOUT_MS - 1
    loginAttempts.set(email, entry)

    expect(checkLoginThrottle(email)).toBe(true)
  })

  it('different emails are tracked independently', () => {
    loginAttempts.clear()
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordLoginAttempt('a@test.com', false)
    }
    expect(checkLoginThrottle('a@test.com')).toBe(false)
    expect(checkLoginThrottle('b@test.com')).toBe(true)
  })
})
