import { render } from '@react-email/render'
import { WelcomeEmail } from './WelcomeEmail'
import { ContactAutoReply } from './ContactAutoReply'
import { AdminNotification } from './AdminNotification'
import { NewsletterCampaign } from './NewsletterCampaign'
import { NewPostNotification } from './NewPostNotification'

export async function renderWelcomeEmail(name?: string) {
  return render(<WelcomeEmail name={name} />)
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

export async function renderNewsletterCampaign(subject: string, bodyHtml: string) {
  return render(<NewsletterCampaign subject={subject} bodyHtml={bodyHtml} />)
}

export async function renderNewPostNotification(args: { title: string; excerpt: string; url: string }) {
  return render(<NewPostNotification {...args} />)
}
