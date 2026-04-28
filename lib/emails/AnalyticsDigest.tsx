import { Heading, Text, Section, Hr } from '@react-email/components'
import { EmailLayout } from './Layout'

const h1 = { fontSize: '28px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 'normal' as const }
const h2 = { fontSize: '20px', color: '#0f172a', margin: '0 0 8px 0', fontWeight: '600' as const }
const p = { color: '#475569', fontSize: '16px', lineHeight: '26px', margin: '0 0 8px 0' }
const stat = { fontSize: '32px', color: '#C9A84C', fontWeight: 'bold' as const, margin: '0' }
const label = { color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 4px 0' }
const listItem = { color: '#475569', fontSize: '15px', lineHeight: '24px', margin: '0 0 4px 0' }

interface DigestProps {
  views: number
  viewsDelta: number
  topPages: Array<{ path: string; count: number }>
  newSubscribers: number
  newMessages: number
  periodDays: number
}

export function AnalyticsDigest({
  views,
  viewsDelta,
  topPages,
  newSubscribers,
  newMessages,
  periodDays,
}: DigestProps) {
  const deltaLabel = viewsDelta >= 0 ? `+${viewsDelta}%` : `${viewsDelta}%`
  const deltaColor = viewsDelta >= 0 ? '#16a34a' : '#dc2626'

  return (
    <EmailLayout preview={`Weekly digest: ${views} views, ${newSubscribers} new subscribers`}>
      <Heading style={h1}>Weekly Digest</Heading>
      <Text style={p}>
        Here&apos;s your site performance for the last {periodDays} days.
      </Text>

      <Hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />

      <Section>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tr>
            <td style={{ padding: '0 16px 16px 0' }}>
              <Text style={label}>Page Views</Text>
              <Text style={stat}>{views.toLocaleString()}</Text>
              <Text style={{ ...p, fontSize: '14px', color: deltaColor, margin: '4px 0 0 0' }}>
                {deltaLabel} vs previous period
              </Text>
            </td>
            <td style={{ padding: '0 16px 16px 0' }}>
              <Text style={label}>New Subscribers</Text>
              <Text style={stat}>{newSubscribers}</Text>
            </td>
            <td style={{ padding: '0 0 16px 0' }}>
              <Text style={label}>Messages</Text>
              <Text style={stat}>{newMessages}</Text>
            </td>
          </tr>
        </table>
      </Section>

      {topPages.length > 0 && (
        <Section>
          <Heading style={h2}>Top Pages</Heading>
          {topPages.map((page, i) => (
            <Text key={i} style={listItem}>
              {i + 1}. {page.path} — {page.count} views
            </Text>
          ))}
        </Section>
      )}

      <Hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />
      <Text style={{ ...p, fontSize: '13px', color: '#94a3b8' }}>
        This digest is sent from your portfolio site. Manage it from your admin panel.
      </Text>
    </EmailLayout>
  )
}
