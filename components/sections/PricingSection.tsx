'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

const models = [
  {
    name: 'Project',
    description: 'A defined scope, timeline, and deliverable. Best for one-off builds, launches, and migrations.',
    features: [
      'Fixed scope & timeline',
      'Milestone-based delivery',
      'Full handover & documentation',
      'Post-launch support window',
    ],
    cta: 'Start a project',
    href: '/contact',
    highlight: false,
  },
  {
    name: 'Retainer',
    description: 'Ongoing partnership with a set number of hours per month. Best for teams that need consistent technical leadership.',
    features: [
      'Dedicated monthly hours',
      'Priority response time',
      'Strategic advisory included',
      'Flexible scope each month',
    ],
    cta: 'Book a retainer',
    href: '/contact',
    highlight: true,
  },
  {
    name: 'Consulting',
    description: 'Strategic guidance without execution. Best for founders and leaders who need expert input on decisions.',
    features: [
      'Architecture & strategy reviews',
      'Team capability assessments',
      'Technology roadmap planning',
      'One-off or recurring sessions',
    ],
    cta: 'Book a session',
    href: 'https://calendly.com/derricklamarh/strategy-consultation-call-with-desderio',
    highlight: false,
  },
]

export function PricingSection() {
  return (
    <Section className="bg-slate-50 dark:bg-slate-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Eyebrow className="mb-2">Engagement models</Eyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white mb-4">
            How we can work together.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Every engagement is different. Choose the model that fits your needs, or let&apos;s design something custom.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {models.map((model, idx) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                model.highlight
                  ? 'bg-brand text-white shadow-2xl shadow-brand/20 scale-105'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {model.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full uppercase tracking-widest">
                  Most popular
                </span>
              )}

              <h3 className={`font-serif text-2xl mb-3 ${model.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {model.name}
              </h3>
              <p className={`text-sm leading-relaxed mb-8 ${model.highlight ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>
                {model.description}
              </p>

              <ul className="space-y-3 mb-10 flex-1">
                {model.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${model.highlight ? 'text-white' : 'text-brand'}`} />
                    <span className={`text-sm ${model.highlight ? 'text-white/90' : 'text-slate-700 dark:text-slate-300'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={model.href}
                variant={model.highlight ? 'invert' : 'primary'}
                size="md"
                className="w-full justify-center"
              >
                {model.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
