import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Fire-and-forget: record the open event
  try {
    const log = await prisma.emailLog.findUnique({ where: { id } })
    if (log) {
      const now = new Date()
      await Promise.all([
        // Mark first open
        !log.openedAt
          ? prisma.emailLog.update({ where: { id }, data: { openedAt: now } })
          : null,
        // Always record the event (tracks repeat opens)
        prisma.emailEvent.create({
          data: {
            emailLogId: id,
            event: 'open',
            ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
            userAgent: req.headers.get('user-agent') ?? undefined,
          },
        }),
        // Increment campaign open count on first open
        !log.openedAt && log.campaignId
          ? prisma.newsletterCampaign.update({
              where: { id: log.campaignId },
              data: { openCount: { increment: 1 } },
            })
          : null,
      ])
    }
  } catch {
    // Silent — tracking must never break the email experience
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
