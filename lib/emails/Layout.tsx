import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import { ReactNode } from 'react'

const body = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#0f172a',
  margin: 0,
  padding: 0,
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const footerSection = {
  borderTop: '1px solid #e2e8f0',
  marginTop: '32px',
  paddingTop: '16px',
}

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

export function EmailLayout({
  preview,
  children,
  footer,
}: {
  preview: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {children}
          <Section style={footerSection}>
            {footer ?? (
              <Text style={footerText}>
                Bodo Desderio · Kampala, Uganda · bododesderio.com
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
