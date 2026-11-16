import type { Metadata } from 'next'
import { getPersonalProfile } from '@/lib/data/profile'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { ContactForm } from '@/components/sections/ContactForm'
import { ldJson, contactPageSchema } from '@/lib/schema'
import { safePublicHref } from '@/lib/domain/profile'
export const dynamic = 'force-dynamic'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Bodo Desderio. Email, social profiles, and a place to say hello.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: { title: 'Contact · Bodo Desderio', url: '/contact' },
}
export default async function ContactPage() {
  const profile = await getPersonalProfile()
  const email = profile.settings['site.email'] || 'info@bododesderio.com'
  const booking = safePublicHref(profile.settings['site.calendly_url'] || '')
  return (
    <EntryLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson(contactPageSchema(email, profile.location)),
        }}
      />
      <EntryHeading
        eyebrow="A place to say hello"
        title="Get in touch"
        description="An idea, a question, a shared interest, or simply a hello. I’d love to hear from you."
      />
      <div className="personal-contact-layout">
        <div className="personal-contact-details">
          <p className="personal-eyebrow">Email</p>
          <a className="personal-contact-email" href={`mailto:${email}`}>
            {email} ↗
          </a>
          <p>
            I’m based in {profile.location}. You can email me directly or leave
            a message here.
          </p>
          <div className="personal-contact-socials">
            {profile.socials.map((item) => (
              <a
                href={item.href}
                key={item.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label} ↗
              </a>
            ))}
          </div>
          {booking && (
            <a
              className="personal-inline-link"
              href={booking}
              target="_blank"
              rel="noopener noreferrer"
            >
              Find a time to talk ↗
            </a>
          )}
        </div>
        <ContactForm />
      </div>
    </EntryLayout>
  )
}
