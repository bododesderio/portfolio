import type { Metadata } from 'next'
import { getPageContent, getField } from '@/lib/data/content'
import { sanitizeHtml } from '@/lib/util/sanitize'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Bodo Desderio',
  description: 'Terms and conditions for using bododesderio.com.',
  openGraph: {
    title: 'Terms & Conditions — Bodo Desderio',
    description: 'Terms and conditions for using bododesderio.com.',
    url: '/terms',
    type: 'website',
  },
  robots: { index: false },
}

export default async function TermsPage() {
  const content = await getPageContent('terms')
  const title = getField(content, 'hero.title') || 'Terms & Conditions'
  const updated = getField(content, 'hero.updated') || 'April 2026'
  const body = getField(content, 'body.html') || defaultBody

  return (
    <article className="max-w-3xl mx-auto px-6 py-24 text-fg">
      <h1 className="font-serif text-4xl md:text-5xl mb-8">{title}</h1>
      <p className="text-fg-muted mb-6">Last updated: {updated}</p>
      <div
        className="prose prose-slate dark:prose-invert max-w-none space-y-6 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-brand [&_a:hover]:underline"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
      />
    </article>
  )
}

const defaultBody = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing and using bododesderio.com, you agree to be bound by these terms and conditions. If you do not agree, please do not use this website.</p>

<h2>2. Intellectual Property</h2>
<p>All content on this website — including text, images, design, code, and branding — is the property of Bodo Desderio unless otherwise stated. You may not reproduce, distribute, or create derivative works without prior written permission.</p>

<h2>3. User Content</h2>
<p>When submitting content through the contact form or newsletter signup, you grant us permission to store and process that information as described in our <a href="/privacy">Privacy Policy</a>.</p>

<h2>4. Blog Content</h2>
<p>Blog posts and essays represent personal views and opinions. While we strive for accuracy, we make no guarantees about the completeness or reliability of any content. External links are provided for convenience and do not imply endorsement.</p>

<h2>5. Services</h2>
<p>Information about services provided through this website is for informational purposes. Specific engagement terms will be agreed upon separately through formal contracts or agreements.</p>

<h2>6. Limitation of Liability</h2>
<p>This website is provided "as is" without warranties of any kind. Bodo Desderio shall not be liable for any damages arising from the use or inability to use this website.</p>

<h2>7. Changes to Terms</h2>
<p>We reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the revised terms.</p>

<h2>8. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of the Republic of Uganda.</p>

<h2>9. Contact</h2>
<p>For questions about these terms, contact us at <a href="mailto:hello@bododesderio.com">hello@bododesderio.com</a>.</p>
`
