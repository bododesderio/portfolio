'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface AboutContent {
  pretitle: string
  heading: string
  paragraphs: string[]
  ctaLabel: string
  ctaUrl: string
}

const EASE = [0.16, 1, 0.3, 1] as const

export function AboutSection({ content }: { content: AboutContent }) {
  return (
    <Section className="relative bg-white dark:bg-ink-900 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-4 left-4 md:left-8 font-serif text-[180px] md:text-[280px] leading-none text-ink-100/60 dark:text-white/[0.03] select-none"
      >
        01
      </div>

      <Container className="relative">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="md:col-span-4"
          >
            <Eyebrow className="mb-4">{content.pretitle}</Eyebrow>
            <h2 className="font-serif text-h1 text-ink-900 dark:text-white">
              {content.heading}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
            className="md:col-span-7 md:col-start-6 space-y-5"
          >
            {content.paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={`leading-relaxed ${
                  idx === 0
                    ? 'text-xl md:text-2xl text-ink-900 dark:text-white font-light'
                    : 'text-base text-ink-500 dark:text-ink-300'
                }`}
              >
                {p}
              </p>
            ))}

            <div className="pt-4">
              <Button
                href={content.ctaUrl}
                variant="outline-dark"
                size="md"
                icon={<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              >
                {content.ctaLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
