export const dynamic = 'force-dynamic'

import { getPageContent, getField, getJsonField } from '@/lib/content'
import { prisma } from '@/lib/db'
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { BioSection } from '@/components/sections/BioSection'
import { FeaturedProjectSection } from '@/components/sections/FeaturedProjectSection'
import { ExpertiseSection } from '@/components/sections/ExpertiseSection'
import { CommunitySection } from '@/components/sections/CommunitySection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ClientsSection } from '@/components/sections/ClientsSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ToolsSection } from '@/components/sections/ToolsSection'
import { CTASection } from '@/components/sections/CTASection'
import { BlogSection } from '@/components/sections/BlogSection'
import { AvailabilitySection } from '@/components/sections/AvailabilitySection'
import { PressSection } from '@/components/sections/PressSection'
import { fetchMediumPosts } from '@/lib/medium'

export const metadata = {
  title: 'Bodo Desderio — Founder, Engineer & Community Leader | Kampala, Uganda',
  description: 'Bodo Desderio is a Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies. Former President, African Youth Congress Uganda.',
}

export default async function HomePage() {
  const content = await getPageContent('home')

  // Hero
  const hero = {
    pretitle: getField(content, 'hero.pretitle'),
    headline: getField(content, 'hero.headline'),
    tagline: getField(content, 'hero.tagline'),
    ctaPrimaryLabel: getField(content, 'hero.cta_primary_label'),
    ctaPrimaryUrl: getField(content, 'hero.cta_primary_url'),
    ctaSecondaryLabel: getField(content, 'hero.cta_secondary_label'),
    ctaSecondaryUrl: getField(content, 'hero.cta_secondary_url'),
    photo: getField(content, 'hero.photo'),
    backgroundImage: getField(content, 'hero.background_image') || undefined,
  }

  // Stats
  const stats = getJsonField<Array<{value: string; suffix: string; label: string}>>(content, 'stats.items') || []

  // About snippet
  const about = {
    pretitle: getField(content, 'about.pretitle'),
    heading: getField(content, 'about.heading'),
    paragraphs: [
      getField(content, 'about.paragraph_1'),
      getField(content, 'about.paragraph_2'),
      getField(content, 'about.paragraph_3'),
    ],
    ctaLabel: getField(content, 'about.cta_label'),
    ctaUrl: getField(content, 'about.cta_url'),
  }

  // Bio
  const bio = {
    heading: getField(content, 'bio.heading'),
    body: getField(content, 'bio.body'),
    pullquote: getField(content, 'bio.pullquote'),
    roles: getJsonField<Array<{title: string; org: string; period: string}>>(content, 'bio.roles') || [],
  }

  // Featured project from gallery (featured flag)
  const featuredGalleryItem = await prisma.galleryItem.findFirst({
    where: { featured: true },
    include: { media: true },
  })

  // Expertise
  const expertise = {
    pretitle: getField(content, 'expertise.pretitle'),
    heading: getField(content, 'expertise.heading'),
    lead: getField(content, 'expertise.lead'),
    ctaLabel: getField(content, 'expertise.cta_label'),
  }
  const services = await prisma.service.findMany({
    where: { visible: true, homeFeatured: true },
    orderBy: { order: 'asc' },
  })

  // Community
  const community = {
    pretitle: getField(content, 'community.pretitle'),
    heading: getField(content, 'community.heading'),
    body: getField(content, 'community.body'),
    ctaLabel: getField(content, 'community.cta_label'),
    ctaUrl: getField(content, 'community.cta_url'),
  }

  // Process
  const process = {
    pretitle: getField(content, 'process.pretitle'),
    heading: getField(content, 'process.heading'),
    steps: getJsonField<Array<{icon: string; title: string; desc: string}>>(content, 'process.steps') || [],
  }

  // Clients
  const clients = await prisma.client.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
    include: { logo: true },
  })

  // Testimonials
  const testimonials = await prisma.testimonial.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
    include: { photo: true },
  })

  // Press items
  const pressItems = await prisma.pressItem.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  }).catch(() => [])

  // Medium posts
  const mediumPosts = await fetchMediumPosts()

  // Blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })

  // CTA Banner
  const cta = {
    heading: getField(content, 'cta.heading'),
    lead: getField(content, 'cta.lead'),
    buttonLabel: getField(content, 'cta.button_label'),
    buttonUrl: getField(content, 'cta.button_url'),
  }

  // Availability
  const availability = {
    status: getField(content, 'availability.status'),
    label: getField(content, 'availability.label'),
    note: getField(content, 'availability.note'),
    ctaLabel: getField(content, 'availability.cta_label'),
    ctaUrl: getField(content, 'availability.cta_url'),
  }

  return (
    <>
      <HeroSection content={hero} />
      <StatsSection stats={stats} />
      <AboutSection content={about} />
      <BioSection content={bio} />
      {featuredGalleryItem && (
        <FeaturedProjectSection
          project={{
            id: featuredGalleryItem.id,
            caption: featuredGalleryItem.caption,
            media: {
              url: featuredGalleryItem.media.url,
              altText: featuredGalleryItem.media.altText,
            },
          }}
        />
      )}
      <ExpertiseSection content={expertise} services={services} />
      <CommunitySection content={community} />
      <PressSection items={pressItems} mediumPosts={mediumPosts} />
      <ProcessSection content={process} />
      <ClientsSection clients={clients} />
      <TestimonialsSection testimonials={testimonials} />
      <ToolsSection />
      <CTASection content={cta} />
      <BlogSection posts={blogPosts} />
      <AvailabilitySection content={availability} />
    </>
  )
}
