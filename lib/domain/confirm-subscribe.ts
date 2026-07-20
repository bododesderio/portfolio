import crypto from 'crypto'

export function confirmUrl(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is required')
  const token = crypto.createHmac('sha256', secret).update('confirm:' + email).digest('hex')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return `${baseUrl}/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${token}`
}

export function verifyConfirmToken(email: string, token: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update('confirm:' + email).digest('hex')
  if (expected.length !== token.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}
