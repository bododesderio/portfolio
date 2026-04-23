import { Heading, Text, Button, Section } from '@react-email/components'
import { EmailLayout } from './Layout'

const h1 = { fontSize: '28px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const p = { color: '#475569', fontSize: '16px', lineHeight: '26px', margin: '0 0 16px 0' }
const btn = {
  backgroundColor: '#C9A84C',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '12px 28px',
  borderRadius: '999px',
  textDecoration: 'none',
}

export function NewPostNotification({
  title,
  excerpt,
  url,
}: {
  title: string
  excerpt: string
  url: string
}) {
  return (
    <EmailLayout preview={`New post: ${title}`}>
      <Heading style={h1}>{title}</Heading>
      <Text style={p}>{excerpt}</Text>
      <Section style={{ textAlign: 'center', margin: '24px 0' }}>
        <Button href={url} style={btn}>
          Read the full post
        </Button>
      </Section>
      <Text style={{ ...p, fontSize: '14px', color: '#94a3b8' }}>
        You received this because you subscribed to updates from Bodo Desderio.
      </Text>
    </EmailLayout>
  )
}
