import { prisma } from './db'
import { sendEmail } from './resend'

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

/**
 * Inject a 1x1 tracking pixel before </body> for open tracking.
 */
function injectTrackingPixel(html: string, emailLogId: string): string {
  const pixel = `<img src="${siteUrl()}/api/t/open/${emailLogId}" width="1" height="1" alt="" style="display:none" />`
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`)
  }
  return html + pixel
}

/**
 * Rewrite all <a href="..."> links to go through the click tracker.
 * Excludes unsubscribe links (must remain direct for CAN-SPAM).
 */
function rewriteLinks(html: string, emailLogId: string): string {
  return html.replace(
    /<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/gi,
    (_match, before, url, after) => {
      // Don't rewrite unsubscribe links
      if (url.includes('unsubscribe')) return `<a ${before}href="${url}"${after}>`
      const tracked = `${siteUrl()}/api/t/click/${emailLogId}?url=${encodeURIComponent(url)}`
      return `<a ${before}href="${tracked}"${after}>`
    },
  )
}

interface TrackedEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  type: string
  campaignId?: string
}

/**
 * Send an email with open + click tracking injected.
 * Creates an EmailLog record and returns it.
 */
export async function sendTrackedEmail({
  to,
  subject,
  html,
  from,
  type,
  campaignId,
}: TrackedEmailOptions) {
  // Create the log entry first so we have an ID for the tracking pixel
  const log = await prisma.emailLog.create({
    data: { to, subject, type, campaignId, status: 'sent' },
  })

  // Inject tracking
  let trackedHtml = injectTrackingPixel(html, log.id)
  trackedHtml = rewriteLinks(trackedHtml, log.id)

  try {
    const result = await sendEmail({ to, subject, html: trackedHtml, from })

    // If Postal returns a message ID, store it for webhook correlation
    const msgId =
      result && typeof result === 'object' && 'messageId' in result
        ? String(result.messageId)
        : null

    if (msgId) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { postalMsgId: msgId },
      })
    }

    return log
  } catch (err) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'failed', failReason: err instanceof Error ? err.message : 'Unknown error' },
    })
    throw err
  }
}

/**
 * Aggregate email stats for a campaign.
 */
export async function campaignEmailStats(campaignId: string) {
  const [total, delivered, opened, clicked, bounced] = await Promise.all([
    prisma.emailLog.count({ where: { campaignId } }),
    prisma.emailLog.count({ where: { campaignId, status: 'delivered' } }),
    prisma.emailLog.count({ where: { campaignId, openedAt: { not: null } } }),
    prisma.emailLog.count({ where: { campaignId, clickedAt: { not: null } } }),
    prisma.emailLog.count({ where: { campaignId, status: 'bounced' } }),
  ])
  return { total, delivered, opened, clicked, bounced }
}

/**
 * Global email stats for the dashboard.
 */
export async function globalEmailStats(days = 30) {
  const since = new Date(Date.now() - days * 86400000)
  const where = { sentAt: { gte: since } }

  const [sent, delivered, opened, clicked, bounced] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.count({ where: { ...where, status: 'delivered' } }),
    prisma.emailLog.count({ where: { ...where, openedAt: { not: null } } }),
    prisma.emailLog.count({ where: { ...where, clickedAt: { not: null } } }),
    prisma.emailLog.count({ where: { ...where, status: 'bounced' } }),
  ])

  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
    bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
  }
}
