import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import crypto from 'crypto'

function verifyToken(email: string, token: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update(email).digest('hex')
  if (expected.length !== token.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email || !token) {
    return NextResponse.json({ error: 'Missing email or token.' }, { status: 400 })
  }

  if (!verifyToken(email, token)) {
    return NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: 403 })
  }

  try {
    await prisma.subscriber.updateMany({
      where: { email },
      data: { confirmed: false },
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
    return Response.redirect(`${baseUrl}/unsubscribe?success=true`, 302)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
