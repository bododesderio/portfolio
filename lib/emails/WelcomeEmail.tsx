import { Heading, Text } from '@react-email/components'
import { EmailLayout } from './Layout'

const h1 = { fontSize: '28px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const p = { color: '#475569', fontSize: '16px', lineHeight: '26px', margin: '0 0 16px 0' }

export function WelcomeEmail({ name }: { name?: string }) {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  return (
    <EmailLayout preview="Welcome — you're in the loop.">
      <Heading style={h1}>Welcome.</Heading>
      <Text style={p}>{greeting}</Text>
      <Text style={p}>
        You&apos;re now subscribed to updates from Bodo Desderio — founder, engineer, and
        community builder based in Kampala, Uganda.
      </Text>
      <Text style={p}>
        I&apos;ll send occasional updates on what I&apos;m building, thinking, and doing. No spam, ever.
      </Text>
      <Text style={p}>— Bodo</Text>
    </EmailLayout>
  )
}
