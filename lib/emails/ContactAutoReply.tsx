import { Heading, Text } from '@react-email/components'
import { EmailLayout } from './Layout'

const h1 = { fontSize: '28px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const p = { color: '#475569', fontSize: '16px', lineHeight: '26px', margin: '0 0 16px 0' }

export function ContactAutoReply({ name }: { name: string }) {
  return (
    <EmailLayout preview="Got your message.">
      <Heading style={h1}>Got your message.</Heading>
      <Text style={p}>
        Hi {name}, thanks for reaching out. I&apos;ve received your message and will get back
        to you within 24–48 hours.
      </Text>
      <Text style={p}>— Bodo Desderio</Text>
    </EmailLayout>
  )
}
