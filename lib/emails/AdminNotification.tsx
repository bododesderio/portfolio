import { Heading, Hr, Text } from '@react-email/components'
import { EmailLayout } from './Layout'

const h2 = { fontSize: '22px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const p = { color: '#0f172a', fontSize: '15px', lineHeight: '24px', margin: '0 0 8px 0' }
const body = { color: '#475569', fontSize: '15px', lineHeight: '24px', whiteSpace: 'pre-wrap' as const, margin: '0' }
const hr = { borderColor: '#e2e8f0', margin: '20px 0' }

export function AdminNotification({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return (
    <EmailLayout preview={`New contact message from ${name}`}>
      <Heading style={h2}>New contact message</Heading>
      <Text style={p}><strong>From:</strong> {name} ({email})</Text>
      <Text style={p}><strong>Subject:</strong> {subject}</Text>
      <Hr style={hr} />
      <Text style={body}>{message}</Text>
    </EmailLayout>
  )
}
