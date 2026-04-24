'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'

interface FaqItem {
  question: string
  answer: string
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0)

  if (!items.length) return null

  return (
    <Section className="bg-surface" spacing="compact">
      <Container className="max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 self-start">
            <Eyebrow className="mb-4">FAQ</Eyebrow>
            <h2 className="font-serif text-4xl text-fg md:text-5xl">
              A few things people usually ask before we work together.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-fg-muted">
              The short version: I care about useful work, strong execution, and relationships
              that outlast a single handoff.
            </p>
          </div>

          <div className="border-t border-hairline">
            {items.map((item, idx) => {
              const isOpen = idx === openIndex

              return (
                <div key={item.question} className="border-b border-hairline">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left md:py-6"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 text-lg font-medium leading-snug text-fg md:text-xl">
                      {item.question}
                    </span>
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-card text-fg-muted">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="max-w-2xl pb-6 pr-14 text-base leading-8 text-fg-muted md:text-[17px]">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
