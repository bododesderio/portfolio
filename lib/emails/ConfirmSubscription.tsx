import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout } from './Layout'

const h1 = { fontSize: '28px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const p = { color: '#475569', fontSize: '16px', lineHeight: '26px', margin: '0 0 16px 0' }
const btn = {
  backgroundColor: '#2563eb',
  borderRadius: '9999px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none' as const,
  textAlign: 'center' as const,
  padding: '12px 32px',
  display: 'inline-block' as const,
  margin: '8px 0 24px 0',
}

export function ConfirmSubscription({ name, confirmUrl }: { name?: string; confirmUrl: string }) {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  return (
    <EmailLayout preview="Please confirm your subscription.">
      <Heading style={h1}>Confirm your subscription.</Heading>
      <Text style={p}>{greeting}</Text>
      <Text style={p}>
        Thanks for signing up to receive updates from Bodo Desderio. Please confirm your
        subscription by clicking the button below.
      </Text>
      <Button href={confirmUrl} style={btn}>
        Confirm Subscription
      </Button>
      <Text style={p}>
        If you didn&apos;t sign up, you can safely ignore this email.
      </Text>
      <Text style={p}>— Bodo</Text>
    </EmailLayout>
  )
}
