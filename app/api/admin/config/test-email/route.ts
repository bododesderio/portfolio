import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminSession } from '@/lib/util/admin-session'
import { getConfig } from '@/lib/config'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderNewsletterCampaign } from '@/lib/emails'

/**
 * Sends one tracked message to the admin address with the saved SMTP settings.
 * It goes through the same path as the newsletter, so a Brevo "delivered" event
 * for it shows the webhook is wired up too.
 */
export async function POST() {
  const session = await auth()
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const to = await getConfig('ADMIN_EMAIL')
  if (!to) return NextResponse.json({ error: 'ADMIN_EMAIL is not set.' }, { status: 400 })

  const subject = 'Test email from bododesderio.com'
  const html = await renderNewsletterCampaign(
    subject,
    '<p>Your SMTP settings work. Within a minute this message should show as delivered under Email logs; if it stays at "sent", the Brevo webhook is not reaching the site.</p>',
  )
  try {
    const log = await sendTrackedEmail({ to, subject, html, type: 'admin_notify' })
    return NextResponse.json({ success: true, to, logId: log.id })
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Unknown SMTP error'
    console.error('[/api/admin/config/test-email]', reason)
    return NextResponse.json({ error: reason }, { status: 502 })
  }
}
