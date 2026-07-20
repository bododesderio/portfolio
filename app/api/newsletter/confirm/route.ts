import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { verifyConfirmToken } from '@/lib/domain/confirm-subscribe'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderWelcomeEmail } from '@/lib/emails'
import { unsubscribeUrl } from '@/lib/domain/unsubscribe'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'

  if (!email || !token) {
    return NextResponse.redirect(`${baseUrl}/subscribe/confirmed?error=true`)
  }

  if (!verifyConfirmToken(email, token)) {
    return NextResponse.redirect(`${baseUrl}/subscribe/confirmed?error=true`)
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email } })

  if (!subscriber) {
    return NextResponse.redirect(`${baseUrl}/subscribe/confirmed?error=true`)
  }

  if (!subscriber.confirmed) {
    await prisma.subscriber.update({
      where: { email },
      data: { confirmed: true },
    })

    // Send the welcome email now that they're confirmed
    const html = await renderWelcomeEmail(subscriber.name ?? undefined, unsubscribeUrl(email))
    await sendTrackedEmail({
      to: email,
      subject: "Welcome — you're in the loop.",
      html,
      type: 'welcome',
    }).catch(() => null)
  }

  return NextResponse.redirect(`${baseUrl}/subscribe/confirmed?success=true`)
}
