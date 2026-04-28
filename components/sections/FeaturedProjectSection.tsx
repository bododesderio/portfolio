'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface Media {
  url: string
  altText?: string | null
}

interface GalleryItem {
  id: string
  caption?: string | null
  media: Media
}

interface FeaturedProjectProps {
  project: GalleryItem | null
}

export function FeaturedProjectSection({ project }: FeaturedProjectProps) {
  if (!project) return null

  return (
    <Section className="bg-white dark:bg-ink-900">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden"
          >
            <Image
              src={project.media.url}
              alt={project.caption || 'Featured project'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Eyebrow className="mb-2">Featured Project</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-fg mb-6">
              {project.caption || 'Selected Work'}
            </h2>
            <p className="text-lg text-fg-muted leading-relaxed">
              A closer look at a project that exemplifies my approach to building technology that creates impact.
            </p>
            <Link href="/gallery" className="inline-flex items-center mt-6 text-brand hover:underline font-medium">
              View this project in the gallery →
            </Link>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
