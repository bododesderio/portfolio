import { Section } from '@react-email/components'
import { EmailLayout } from './Layout'

export function NewsletterCampaign({ subject, bodyHtml, unsubscribeUrl }: { subject: string; bodyHtml: string; unsubscribeUrl?: string }) {
  return (
    <EmailLayout preview={subject} unsubscribeUrl={unsubscribeUrl}>
      <Section dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </EmailLayout>
  )
}
