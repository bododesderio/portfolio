import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { verifyUnsubscribeToken } from '@/lib/domain/unsubscribe'

async function withdraw(req: NextRequest): Promise<'ok' | 'missing' | 'invalid'> {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')
  if (!email || !token) return 'missing'
  if (!verifyUnsubscribeToken(email, token)) return 'invalid'
  await prisma.subscriber.updateMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    data: { confirmed: false },
  })
  return 'ok'
}

/** The link in the email footer: unsubscribes, then shows the confirmation page. */
export async function GET(req: NextRequest) {
  try {
    const result = await withdraw(req)
    if (result === 'missing') return NextResponse.json({ error: 'Missing email or token.' }, { status: 400 })
    if (result === 'invalid') return NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: 403 })
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
    return Response.redirect(`${baseUrl}/unsubscribe?success=true`, 302)
  } catch (err) {
    console.error('[/api/newsletter/unsubscribe]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** RFC 8058 one-click unsubscribe, posted by Gmail/Yahoo from the List-Unsubscribe header. */
export async function POST(req: NextRequest) {
  try {
    const result = await withdraw(req)
    if (result === 'ok') return new NextResponse(null, { status: 200 })
    return NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: result === 'missing' ? 400 : 403 })
  } catch (err) {
    console.error('[/api/newsletter/unsubscribe] one-click', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
