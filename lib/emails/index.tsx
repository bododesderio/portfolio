import { render } from '@react-email/render'
import { WelcomeEmail } from './WelcomeEmail'
import { ContactAutoReply } from './ContactAutoReply'
import { AdminNotification } from './AdminNotification'
import { NewsletterCampaign } from './NewsletterCampaign'
import { NewPostNotification } from './NewPostNotification'
import { AnalyticsDigest } from './AnalyticsDigest'

export async function renderWelcomeEmail(name?: string, unsubscribeUrl?: string) {
  return render(<WelcomeEmail name={name} unsubscribeUrl={unsubscribeUrl} />)
}

export async function renderContactAutoReply(name: string) {
  return render(<ContactAutoReply name={name} />)
}

export async function renderAdminNotification(args: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return render(<AdminNotification {...args} />)
}

export async function renderNewsletterCampaign(subject: string, bodyHtml: string, unsubscribeUrl?: string) {
  return render(<NewsletterCampaign subject={subject} bodyHtml={bodyHtml} unsubscribeUrl={unsubscribeUrl} />)
}

export async function renderNewPostNotification(args: { title: string; excerpt: string; url: string; unsubscribeUrl?: string }) {
  return render(<NewPostNotification {...args} />)
}

export async function renderAnalyticsDigest(args: {
  views: number
  viewsDelta: number
  topPages: Array<{ path: string; count: number }>
  newSubscribers: number
  newMessages: number
  periodDays: number
}) {
  return render(<AnalyticsDigest {...args} />)
}
