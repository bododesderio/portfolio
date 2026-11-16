import type { Session } from 'next-auth'

type AdminSession = Session & {
  user: Session['user'] & { id: string; email: string }
}

/** Auth.js configuration errors can be truthy objects without a signed-in user. */
export function isAdminSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== 'object' || !('user' in value)) return false
  const user = value.user
  if (!user || typeof user !== 'object') return false
  return (
    'id' in user && typeof user.id === 'string' && user.id.trim().length > 0 &&
    'email' in user && typeof user.email === 'string' && user.email.trim().length > 0
  )
}
