export const dynamic = 'force-dynamic'

import { getPageContent, getField, getJsonField } from '@/lib/content'
import { prisma } from '@/lib/db'
import { PageHero } from '@/components/sections/PageHero'
import { ExpertiseSection } from '@/components/sections/ExpertiseSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'
import { ldJson, servicesSchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services — Bodo Desderio',
  description: 'Explore the services I offer: company building, software engineering, SEO & digital strategy, technical consulting, and community programmes.',
}

export default async function ServicesPage() {
  const content = await getPageContent('services')
  const homeContent = await getPageContent('home')

  const hero = {
    heading: getField(content, 'hero.heading') || 'Services',
    subtitle: getField(content, 'hero.subtitle') || '',
    image: getField(content, 'hero.image') || '/images/stock/services-hero.svg',
  }

  // Services list (all visible)
  const services = await prisma.service.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  })

  // Process steps from home
  const process = {
    pretitle: getField(homeContent, 'process.pretitle'),
    heading: getField(homeContent, 'process.heading'),
    steps: getJsonField<Array<{icon: string; title: string; desc: string}>>(homeContent, 'process.steps') || [],
  }

  // Testimonials filtered for services
  const allTestimonials = await prisma.testimonial.findMany({
    where: { visible: true },
    include: { photo: true },
  })
  const testimonials = allTestimonials.filter(t => t.pages.includes('services'))

  const cta = {
    heading: getField(content, 'cta.heading') || 'Ready to start a project?',
    lead: getField(content, 'cta.lead') || 'Book a consultation call to discuss your needs.',
    buttonLabel: getField(content, 'cta.button_label') || 'Book a call',
    buttonUrl: getField(content, 'cta.button_url') || 'https://calendly.com/derricklamarh/strategy-consultation-call-with-desderio',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(servicesSchema(services.map(s => ({ title: s.title, description: s.description })))) }}
      />
      <PageHero title={hero.heading} subtitle={hero.subtitle} image={hero.image} />
      <ExpertiseSection
        content={{
          pretitle: '',
          heading: 'What I do',
          lead: 'I build across disciplines — from founding and running companies, to engineering software, to leading communities.',
          ctaLabel: 'View all services',
        }}
        services={services}
      />
      <ProcessSection content={process} />
      <PricingSection />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection content={cta} />
    </>
  )
}
