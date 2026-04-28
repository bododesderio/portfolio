import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for bododesderio.com — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-24 text-fg">
      <h1 className="font-serif text-4xl md:text-5xl mb-8">Privacy Policy</h1>
      <p className="text-fg-muted mb-6">Last updated: April 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <h2 className="font-serif text-2xl mt-10 mb-4">1. Information We Collect</h2>
        <p>When you visit bododesderio.com, we may collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contact form submissions</strong> — your name, email, subject, and message when you reach out through our contact form.</li>
          <li><strong>Newsletter subscriptions</strong> — your email address and optional name when you subscribe to updates.</li>
          <li><strong>Analytics data</strong> — anonymized page views, referrer URLs, and country (derived from request headers). We do not use cookies for analytics, and we hash user agent strings to prevent identification.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To respond to your messages and inquiries.</li>
          <li>To send newsletter updates you&apos;ve opted into.</li>
          <li>To understand how visitors use the site and improve content.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">3. Data Sharing</h2>
        <p>We do not sell, trade, or share your personal information with third parties, except:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Email delivery</strong> — we use Resend to send emails. Your email address is shared with Resend solely for delivery purposes.</li>
          <li><strong>Image hosting</strong> — uploaded media may be stored via Cloudinary.</li>
          <li><strong>Legal obligations</strong> — if required by law or court order.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">4. Cookies</h2>
        <p>This site uses minimal cookies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Authentication cookie</strong> — used only for the admin panel (not for visitors).</li>
          <li><strong>Theme preference</strong> — stored locally to remember your dark/light mode choice.</li>
          <li><strong>Cookie consent</strong> — stored locally to remember your consent preference.</li>
        </ul>
        <p>We do not use third-party tracking cookies, advertising cookies, or analytics cookies.</p>

        <h2 className="font-serif text-2xl mt-10 mb-4">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Request access to your personal data.</li>
          <li>Request deletion of your data.</li>
          <li>Unsubscribe from the newsletter at any time via the unsubscribe link in every email.</li>
          <li>Opt out of analytics by enabling Do Not Track (DNT) in your browser — we respect it.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">6. Data Retention</h2>
        <p>Contact messages are retained indefinitely unless you request deletion. Newsletter subscribers can unsubscribe at any time. Analytics data is periodically pruned (older than 90 days).</p>

        <h2 className="font-serif text-2xl mt-10 mb-4">7. Contact</h2>
        <p>For privacy-related inquiries, contact us at <a href="mailto:hello@bododesderio.com" className="text-brand hover:underline">hello@bododesderio.com</a>.</p>
      </div>
    </article>
  )
}
