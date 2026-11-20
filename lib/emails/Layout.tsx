import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import { ReactNode } from 'react'
import { emailBrand } from './brand'

const body = {
  backgroundColor: '#f4f1e8',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#14221a',
  margin: 0,
  padding: '24px 0',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 28px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  borderTop: '4px solid #c9a84c',
}

const header = { paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid #ece6d4' }
const wordmark = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  color: '#14221a',
  textDecoration: 'none',
  verticalAlign: 'middle',
}

const footerSection = {
  borderTop: '1px solid #ece6d4',
  marginTop: '32px',
  paddingTop: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7a70',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

export function EmailLayout({
  preview,
  children,
  footer,
  unsubscribeUrl,
}: {
  preview: string
  children: ReactNode
  footer?: ReactNode
  unsubscribeUrl?: string
}) {
  const brand = emailBrand()
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Link href={brand.siteUrl} style={wordmark}>
              <Img
                src={brand.logoUrl}
                width="36"
                height="36"
                alt="BD"
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px', border: 0 }}
              />
              Bodo Desderio
            </Link>
          </Section>
          {children}
          <Section style={footerSection}>
            {brand.socials.length > 0 && (
              <Text style={{ margin: '0 0 14px' }}>
                {brand.socials.map((social) => (
                  <Link key={social.label} href={social.href} style={{ display: 'inline-block', margin: '0 5px' }}>
                    <Img src={social.icon} width="28" height="28" alt={social.label} style={{ border: 0 }} />
                  </Link>
                ))}
              </Text>
            )}
            {footer ?? (
              <Text style={footerText}>
                Bodo Desderio ·{' '}
                <Link href={brand.siteUrl} style={{ color: '#8e7029' }}>
                  bododesderio.com
                </Link>
              </Text>
            )}
            {unsubscribeUrl && (
              <Text style={{ ...footerText, marginTop: '8px' }}>
                <Link href={unsubscribeUrl} style={{ color: '#6b7a70', textDecoration: 'underline' }}>
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
