import type { Metadata } from 'next'
import { getPageContent, getField } from '@/lib/data/content'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { RichText } from '@/components/personal/ProfileContent'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for bododesderio.com: how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy',
    description: 'How bododesderio.com collects, uses, and protects your data.',
    url: '/privacy',
    type: 'website',
  },
  robots: { index: false },
}

export default async function PrivacyPage() {
  const content = await getPageContent('privacy')
  const title = getField(content, 'hero.title') || 'Privacy Policy'
  const updated = getField(content, 'hero.updated') || 'April 2026'
  const body = getField(content, 'body.html') || defaultBody

  return (
    <EntryLayout>
      <EntryHeading
        eyebrow="Site information"
        title={title}
        description={`Last updated: ${updated}`}
      />
      <div className="personal-article-body">
        <RichText html={body} />
      </div>
    </EntryLayout>
  )
}

const defaultBody = `
<h2>1. Information We Collect</h2>
<p>When you visit bododesderio.com, we may collect:</p>
<ul>
  <li><strong>Contact form submissions</strong>: your name, email, subject, and message when you reach out through our contact form.</li>
  <li><strong>Newsletter subscriptions</strong>: your email address and optional name when you subscribe to updates.</li>
  <li><strong>Analytics data</strong>: anonymized page views, referrer URLs, and country (derived from request headers). We do not use cookies for analytics, and we hash user agent strings to prevent identification.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
  <li>To respond to your messages and inquiries.</li>
  <li>To send newsletter updates you've opted into.</li>
  <li>To understand how visitors use the site and improve content.</li>
</ul>

<h2>3. Data Sharing</h2>
<p>We do not sell, trade, or share your personal information with third parties, except:</p>
<ul>
  <li><strong>Email delivery</strong>: we use a self-hosted mail server to send emails. Your email address is processed solely for delivery purposes.</li>
  <li><strong>Legal obligations</strong>: if required by law or court order.</li>
</ul>

<h2>4. Cookies</h2>
<p>This site uses minimal cookies:</p>
<ul>
  <li><strong>Authentication cookie</strong>: used only for the admin panel (not for visitors).</li>
  <li><strong>Theme preference</strong>: stored locally to remember your dark/light mode choice.</li>
  <li><strong>Cookie consent</strong>: stored locally to remember your consent preference.</li>
</ul>
<p>We do not use third-party tracking cookies, advertising cookies, or analytics cookies.</p>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Request access to your personal data.</li>
  <li>Request deletion of your data.</li>
  <li>Unsubscribe from the newsletter at any time via the unsubscribe link in every email.</li>
  <li>Opt out of analytics by enabling Do Not Track (DNT) in your browser, which we respect.</li>
</ul>

<h2>6. Data Retention</h2>
<p>Contact messages are retained indefinitely unless you request deletion. Newsletter subscribers can unsubscribe at any time. Analytics data is periodically pruned (older than 90 days).</p>

<h2>7. Contact</h2>
<p>For privacy-related inquiries, contact us at <a href="mailto:hello@bododesderio.com">hello@bododesderio.com</a>.</p>
`
