import { Section } from '@react-email/components'
import { EmailLayout } from './Layout'

export function NewsletterCampaign({ subject, bodyHtml }: { subject: string; bodyHtml: string }) {
  return (
    <EmailLayout preview={subject}>
      <Section dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </EmailLayout>
  )
}
