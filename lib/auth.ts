import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { DefaultSession } from 'next-auth'
import { getConfig } from './config'
import { prisma } from './db'

// In-memory login attempt tracker (per-process; good enough for single-instance)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

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

export type ThemePreference = 'light' | 'dark' | 'system'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      themePreference: ThemePreference
    } & DefaultSession['user']
  }
}

declare module 'next-auth' {
  interface JWT {
    themePreference?: ThemePreference
  }
}

async function fetchThemePreference(email: string): Promise<ThemePreference> {
  try {
    const row = await prisma.adminUser.findUnique({
      where: { email },
      select: { themePreference: true },
    })
    const v = row?.themePreference
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // DB not reachable (build time) — fall through to default.
  }
  return 'system'
}

const LONG_MAX_AGE  = 30 * 24 * 60 * 60  // 30 days

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        if (!checkLoginThrottle(email)) return null

        const [adminEmail, adminHash] = await Promise.all([
          getConfig('ADMIN_EMAIL'),
          getConfig('ADMIN_PASSWORD_HASH'),
        ])
        if (!adminEmail || !adminHash) return null
        if (email !== adminEmail) { recordLoginAttempt(email, false); return null }

        const valid = await bcrypt.compare(credentials.password as string, adminHash)
        if (!valid) { recordLoginAttempt(email, false); return null }

        recordLoginAttempt(email, true)

        await prisma.adminUser.updateMany({
          where: { email: adminEmail },
          data: { lastLogin: new Date() },
        }).catch(() => {})

        return { id: '1', email: adminEmail, name: 'Admin' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        // Store remember-me preference in the token on first sign-in
        const rememberMe = (account as Record<string, unknown> | null)?.rememberMe
        token.rememberMe = rememberMe === 'true' || rememberMe === true
        // Set expiry only once at login — not on every callback
        if (token.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + LONG_MAX_AGE
        }
      }

      // Fetch preference lazily: first time after login, or when the client
      // calls update() to signal a refresh after the admin changes it.
      const needsFetch = trigger === 'update' || (token.themePreference === undefined && !!token.email)
      if (needsFetch && token.email) {
        token.themePreference = await fetchThemePreference(token.email as string)
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.email = token.email as string
        session.user.themePreference = (token.themePreference ?? 'system') as ThemePreference
      }
      return session
    },
  },
  pages: { signIn: '/admin/login' },
  session: {
    strategy: 'jwt',
    maxAge: LONG_MAX_AGE, // Upper bound; actual expiry controlled by jwt callback
  },
})
