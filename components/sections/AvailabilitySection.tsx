'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

interface AvailabilityContent {
  status: string
  label: string
  note: string
  ctaLabel: string
  ctaUrl: string
}

export function AvailabilitySection({ content }: { content: AvailabilityContent }) {
  const isAvailable = content.status === 'available'
  const dotColor = isAvailable ? 'bg-emerald-400' : 'bg-amber-400'

  return (
    <section className="relative py-20 bg-ink-50 dark:bg-ink-800/50 border-y border-hairline">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75 animate-ping`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
            </span>
            <span className="text-[11px] uppercase tracking-brand text-ink-500 dark:text-ink-300">
              {isAvailable ? 'Currently available' : 'Currently closed'}
            </span>
          </div>

          <div className="max-w-lg">
            <p className="font-serif text-xl text-ink-900 dark:text-white mb-1">{content.label}</p>
            <p className="text-sm text-ink-500 dark:text-ink-300">{content.note}</p>
          </div>

          <Button href={content.ctaUrl} variant="primary" size="md">
            {content.ctaLabel}
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}
