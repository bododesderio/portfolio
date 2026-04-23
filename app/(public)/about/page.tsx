export const dynamic = 'force-dynamic'

import { getPageContent, getField, getJsonField } from '@/lib/content'
import { prisma } from '@/lib/db'
import { PageHero } from '@/components/sections/PageHero'
import { MissionStatement } from '@/components/sections/MissionStatement'
import { BioSection } from '@/components/sections/BioSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { ValuesSection } from '@/components/sections/ValuesSection'
import { WhyWorkWithMe } from '@/components/sections/WhyWorkWithMe'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'
import { PressSection } from '@/components/sections/PressSection'
import { fetchMediumPosts } from '@/lib/medium'
import { ldJson, profilePageSchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Bodo Desderio',
  description: 'Learn more about Bodo Desderio, his story, values, and work.',
}

export default async function AboutPage() {
  const content = await getPageContent('about')
  const homeContent = await getPageContent('home')

  // Hero
  const hero = {
    title: getField(content, 'hero.heading') || 'About',
    subtitle: getField(content, 'hero.subtitle') || '',
    image: getField(content, 'hero.image') || '/images/stock/about-hero.svg',
  }

  // Mission
  const mission = getField(content, 'mission.statement')

  // Bio (reuse from home)
  const bio = {
    heading: getField(homeContent, 'bio.heading'),
    body: getField(homeContent, 'bio.body'),
    pullquote: getField(homeContent, 'bio.pullquote'),
    roles: getJsonField<Array<{title: string; org: string; period: string}>>(homeContent, 'bio.roles') || [],
  }

  // Timeline (My Story)
  const timeline = getJsonField<Array<{
    year?: string
    title: string
    organization?: string
    description?: string
    icon?: 'calendar' | 'briefcase' | 'award'
  }>>(content, 'story.items') || []

  // Values
  const values = getJsonField<Array<{
    title: string
    description: string
    icon?: string
  }>>(content, 'values.items') || []

  // Why Work With Me
  const whyItems = getJsonField<Array<{title: string; description: string}>>(content, 'why.items') || []

  // Testimonials filtered for about page
  const allTestimonials = await prisma.testimonial.findMany({
    where: { visible: true },
    include: { photo: true },
  })
  const testimonials = allTestimonials.filter(t => t.pages.includes('about'))

  // Press items
  const pressItems = await prisma.pressItem.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  }).catch(() => [])

  // Medium posts
  const mediumPosts = await fetchMediumPosts()

  // CTA
  const cta = {
    heading: getField(content, 'cta.heading'),
    lead: getField(content, 'cta.lead'),
    buttonLabel: getField(content, 'cta.button_label'),
    buttonUrl: getField(content, 'cta.button_url'),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(profilePageSchema()) }}
      />
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} portrait="/images/hero/portrait-about.png" />
      {mission && <MissionStatement text={mission} />}
      <BioSection content={bio} />
      <TimelineSection items={timeline} />
      <ValuesSection values={values} />
      <WhyWorkWithMe items={whyItems} />
      <PressSection items={pressItems} mediumPosts={mediumPosts} />
      <TestimonialsSection testimonials={testimonials} />
      {cta.heading && <CTASection content={cta} />}
    </>
  )
}
