import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { DefaultSession } from 'next-auth'
import { getConfig } from './config'
import { prisma } from './db'

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [adminEmail, adminHash] = await Promise.all([
          getConfig('ADMIN_EMAIL'),
          getConfig('ADMIN_PASSWORD_HASH'),
        ])
        if (!adminEmail || !adminHash) return null
        if (credentials.email !== adminEmail) return null

        const valid = await bcrypt.compare(credentials.password as string, adminHash)
        if (!valid) return null

        return { id: '1', email: adminEmail, name: 'Admin' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
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
        session.user.themePreference = (token.themePreference ?? 'system') as ThemePreference
      }
      return session
    },
  },
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
})
