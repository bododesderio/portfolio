'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

interface CTAContent {
  heading: string
  lead: string
  buttonLabel: string
  buttonUrl: string
}

export function CTASection({ content }: { content: CTAContent }) {
  return (
    <Section className="relative overflow-hidden bg-ink-900 text-white">
      <div aria-hidden className="absolute inset-0 bg-radial-brand opacity-80" />
      <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.07] mix-blend-overlay" />
      <div aria-hidden className="absolute inset-0 bg-grid-dark bg-grid-md opacity-[0.15] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent_70%)]" />

      <Container size="narrow" className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[11px] uppercase tracking-brand text-brand-300 mb-5">Let&apos;s talk</p>
          <h2 className="font-serif text-display text-white mb-6">
            {content.heading}
          </h2>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto mb-10">
            {content.lead}
          </p>
          <Button
            href={content.buttonUrl}
            variant="invert"
            size="lg"
            className="ring-halo"
            icon={<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
          >
            {content.buttonLabel}
          </Button>
        </motion.div>
      </Container>
    </Section>
  )
}
