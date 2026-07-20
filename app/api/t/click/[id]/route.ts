import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { isSameOriginUrl, verifyTrackedUrl } from '@/lib/util/link-signing'
import { getClientIp, rateLimit } from '@/lib/util/rate-limit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const url = req.nextUrl.searchParams.get('url')
  const signature = req.nextUrl.searchParams.get('sig')
  const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL || '/'

  if (!url) return NextResponse.redirect(fallbackUrl)

  let target: URL
  try {
    target = new URL(url)
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Unsupported protocol')
  } catch {
    return NextResponse.redirect(fallbackUrl)
  }

  // Only redirect to destinations we signed. Anything else would make this an
  // open redirect on our own domain — a valid EmailLog id is self-serve, so the
  // id alone is not an access control. Links from emails sent before signing
  // existed are still honoured when they point back at our own site, which
  // carries no phishing value.
  if (!verifyTrackedUrl(id, url, signature) && !isSameOriginUrl(target)) {
    return NextResponse.redirect(fallbackUrl)
  }

  // Bound event writes per link per client; the redirect itself still works.
  const { ok: underLimit } = await rateLimit(`t-click:${id}:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  })
  if (!underLimit) return NextResponse.redirect(target.toString(), 302)

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
          ip: getClientIp(req),
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
