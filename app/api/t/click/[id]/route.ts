import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL || '/')
  }

  // Fire-and-forget: record the click event
  try {
    const log = await prisma.emailLog.findUnique({ where: { id } })
    if (log) {
      const now = new Date()
      await Promise.all([
        // Mark first click
        !log.clickedAt
          ? prisma.emailLog.update({ where: { id }, data: { clickedAt: now } })
          : null,
        // Record every click with the target URL
        prisma.emailEvent.create({
          data: {
            emailLogId: id,
            event: 'click',
            url,
            ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
            userAgent: req.headers.get('user-agent') ?? undefined,
          },
        }),
        // Increment campaign click count on first click
        !log.clickedAt && log.campaignId
          ? prisma.newsletterCampaign.update({
              where: { id: log.campaignId },
              data: { clickCount: { increment: 1 } },
            })
          : null,
      ])
    }
  } catch {
    // Silent — always redirect even if tracking fails
  }

  return NextResponse.redirect(url, 302)
}
