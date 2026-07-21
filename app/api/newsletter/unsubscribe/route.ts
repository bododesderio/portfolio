import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { verifyUnsubscribeToken } from '@/lib/domain/unsubscribe'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email || !token) {
    return NextResponse.json({ error: 'Missing email or token.' }, { status: 400 })
  }

  if (!verifyUnsubscribeToken(email, token)) {
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
