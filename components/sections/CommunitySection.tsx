'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface CommunityContent {
  pretitle: string
  heading: string
  body: string
  ctaLabel: string
  ctaUrl: string
}

export function CommunitySection({ content }: { content: CommunityContent }) {
  return (
    <Section className="bg-surface-2">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-64 md:h-96 rounded-2xl overflow-hidden"
          >
            {/* Placeholder image – could replace with a real community photo */}
            <Image
              src="/images/gallery/IMG_5207.jpg"
              alt="Community event"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Eyebrow className="mb-2">{content.pretitle}</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-fg mb-6">
              {content.heading}
            </h2>
            <p className="text-lg text-fg-muted leading-relaxed mb-6">
              {content.body}
            </p>
            <Link href={content.ctaUrl} className="inline-flex items-center text-brand hover:underline font-medium">
              {content.ctaLabel}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
