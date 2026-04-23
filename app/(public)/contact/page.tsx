export const dynamic = 'force-dynamic'

import { getPageContent, getField, getSiteSettings } from '@/lib/content'
import { prisma } from '@/lib/db'
import { PageHero } from '@/components/sections/PageHero'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'
import { ContactForm } from '@/components/sections/ContactForm'
import { ldJson, contactPageSchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Bodo Desderio',
  description: 'Get in touch with Bodo Desderio. Ready to build something together?',
}

export default async function ContactPage() {
  const content = await getPageContent('contact')
  const settings = await getSiteSettings()

  const hero = {
    title: getField(content, 'hero.heading') || 'Contact',
    subtitle: getField(content, 'hero.subtitle') || 'Ready to build something together?',
    image: getField(content, 'hero.image') || '/images/stock/contact-hero.svg',
  }

  const allTestimonials = await prisma.testimonial.findMany({
    where: { visible: true },
    include: { photo: true },
  })
  const testimonials = allTestimonials.filter(t => t.pages.includes('contact'))

  const cta = {
    heading: "Let's build something that matters.",
    lead: "Whether you need a technology partner, a strategic consultant, or a collaborator on something bigger — I'm open to conversations that lead somewhere real.",
    buttonLabel: 'Book a consultation',
    buttonUrl: settings['site.calendly_url'] || '/contact',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(contactPageSchema(settings['site.email'] || 'info@bododesderio.com', settings['site.location'] || 'Kampala, Uganda')) }}
      />
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-brand text-sm uppercase tracking-widest mb-2">Get in touch</p>
              <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white mb-6">
                Ready to build something together?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Fill in the form and I&apos;ll get back to you within 24–48 hours.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Email</p>
                  <a href={`mailto:${settings['site.email']}`} className="text-brand hover:underline font-medium">
                    {settings['site.email']}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-slate-700 dark:text-slate-300">{settings['site.location']}</p>
                </div>
                {settings['site.calendly_url'] && (
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Book a call</p>
                    <a
                      href={settings['site.calendly_url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-medium"
                    >
                      Schedule via Calendly →
                    </a>
                  </div>
                )}
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <TestimonialsSection testimonials={testimonials} />
      <CTASection content={cta} />
    </>
  )
}
