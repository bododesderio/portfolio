import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const url = req.nextUrl.searchParams.get('url')
  const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL || '/'

  if (!url) return NextResponse.redirect(fallbackUrl)

  let target: URL
  try {
    target = new URL(url)
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Unsupported protocol')
  } catch {
    return NextResponse.redirect(fallbackUrl)
  }

  try {
    const log = await prisma.emailLog.findUnique({ where: { id } })
    if (!log) return NextResponse.redirect(fallbackUrl)

    const now = new Date()
    await Promise.all([
      !log.clickedAt
        ? prisma.emailLog.update({ where: { id }, data: { clickedAt: now } })
        : null,
      prisma.emailEvent.create({
        data: {
          emailLogId: id,
          event: 'click',
          url: target.toString(),
          ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
          userAgent: req.headers.get('user-agent') ?? undefined,
        },
      }),
      !log.clickedAt && log.campaignId
        ? prisma.newsletterCampaign.update({
            where: { id: log.campaignId },
            data: { clickCount: { increment: 1 } },
          })
        : null,
    ])
  } catch {
    return NextResponse.redirect(fallbackUrl)
  }

  return NextResponse.redirect(target.toString(), 302)
}
