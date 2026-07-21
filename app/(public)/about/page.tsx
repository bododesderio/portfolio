export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getField, getJsonField, getPageContent } from '@/lib/data/content'
import { prisma } from '@/lib/data/db'
import { fetchMediumPosts } from '@/lib/domain/medium'
import { ldJson, profilePageSchema } from '@/lib/schema'
import { BioSection } from '@/components/sections/BioSection'
import { AboutGallerySection } from '@/components/sections/AboutGallerySection'
import { CTASection } from '@/components/sections/CTASection'
import { FaqSection } from '@/components/sections/FaqSection'
import { MissionStatement } from '@/components/sections/MissionStatement'
import { PageHero } from '@/components/sections/PageHero'
import { PressSection } from '@/components/sections/PressSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { ValuesSection } from '@/components/sections/ValuesSection'
import { WhyWorkWithMe } from '@/components/sections/WhyWorkWithMe'
import { PhotoStrip } from '@/components/sections/PhotoStrip'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'

export const metadata: Metadata = {
  title: 'About — Bodo Desderio',
  description: 'Learn more about Bodo Desderio — his story, values, mission, and the work he does across tech, business, and community in Uganda.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About — Bodo Desderio',
    description: 'Ugandan entrepreneur, software engineer, and community builder. Founder & CEO of Rooibok Technologies.',
    url: '/about',
    type: 'profile',
    images: [{ url: `${SITE_URL}/opengraph-image` }],
  },
  twitter: { card: 'summary_large_image', images: [`${SITE_URL}/opengraph-image`] },
}

const DEFAULT_FAQS = [
  {
    question: 'What kind of work does Bodo usually take on?',
    answer:
      'Most engagements sit somewhere between product thinking, software delivery, and strategic problem-solving. That can mean building a digital product, shaping a technical roadmap, advising a founder, or helping a team move from scattered ideas to a clearer system.',
  },
  {
    question: 'Is he only available for software engineering work?',
    answer:
      'No. Engineering is a big part of the work, but not the whole thing. Bodo also works on company building, technical consulting, digital strategy, and initiatives that combine technology with education, community, or public-interest work.',
  },
  {
    question: 'Does he work with organisations outside Uganda?',
    answer:
      'Yes. He is based in Kampala, but collaborates with teams across East Africa and beyond. The work is shaped by African contexts first, while still being comfortable in cross-border product and partnership environments.',
  },
  {
    question: 'What is it like to work with him?',
    answer:
      'Direct, thoughtful, and outcome-focused. Bodo tends to work best with people who value clarity, momentum, and honest collaboration. The goal is not just to ship something quickly, but to leave the work stronger, clearer, and more sustainable than it was before.',
  },
]

export default async function AboutPage() {
  const content = await getPageContent('about')
  const homeContent = await getPageContent('home')

  const hero = {
    title: getField(content, 'hero.heading') || 'About',
    subtitle: getField(content, 'hero.subtitle') || '',
    image: getField(content, 'hero.image') || '/images/stock/about-hero.svg',
  }

  const mission = getField(content, 'mission.statement')

  const bio = {
    heading: getField(homeContent, 'bio.heading'),
    body: getField(homeContent, 'bio.body'),
    pullquote: getField(homeContent, 'bio.pullquote'),
    roles:
      getJsonField<Array<{ title: string; org: string; period: string }>>(
        homeContent,
        'bio.roles'
      ) || [],
  }

  const timeline =
    getJsonField<
      Array<{
        year?: string
        title: string
        organization?: string
        description?: string
        icon?: 'calendar' | 'briefcase' | 'award'
      }>
    >(content, 'story.items') || []

  const values =
    getJsonField<
      Array<{
        title: string
        description: string
        icon?: string
      }>
    >(content, 'values.items') || []

  const whyItems =
    getJsonField<Array<{ title: string; description: string }>>(content, 'why.items') || []

  const faqItems =
    getJsonField<Array<{ question: string; answer: string }>>(content, 'faq.items') ||
    DEFAULT_FAQS

  const [aboutGalleryItems, allTestimonials, pressItems, mediumPosts] = await Promise.all([
    prisma.galleryItem.findMany({
      include: { media: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      take: 18,
    }).catch(() => []),
    prisma.testimonial.findMany({
      where: { visible: true },
      include: { photo: true },
    }).catch(() => []),
    prisma.pressItem.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    }).catch(() => []),
    fetchMediumPosts(),
  ])

  const testimonials = allTestimonials.filter(t => t.pages.includes('about'))

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
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        portrait="/images/hero/portrait-about.png"
      />
      {mission && <MissionStatement text={mission} />}
      <BioSection content={bio} />
      <AboutGallerySection items={aboutGalleryItems.slice(0, 6)} />
      <TimelineSection items={timeline} />
      <PhotoStrip items={aboutGalleryItems.slice(6, 12)} />
      <ValuesSection values={values} />
      <WhyWorkWithMe items={whyItems} />
      <PhotoStrip items={aboutGalleryItems.slice(12, 18)} />
      <FaqSection items={faqItems} />
      <PressSection items={pressItems} mediumPosts={mediumPosts} />
      <TestimonialsSection testimonials={testimonials} />
      {cta.heading && <CTASection content={cta} />}
    </>
  )
}
