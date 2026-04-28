import crypto from 'crypto'

export function unsubscribeUrl(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
  const token = crypto.createHmac('sha256', secret).update(email).digest('hex')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}
