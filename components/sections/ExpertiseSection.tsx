'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building, Code, TrendingUp, Lightbulb, Users, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface Service {
  id: string
  title: string
  description: string
  icon: string
  homeFeatured: boolean
  order: number
  visible: boolean
}

interface ExpertiseContent {
  pretitle: string
  heading: string
  lead: string
  ctaLabel: string
}

const iconMap: Record<string, React.ElementType> = {
  building: Building,
  code: Code,
  'trending-up': TrendingUp,
  lightbulb: Lightbulb,
  users: Users,
}

const EASE = [0.16, 1, 0.3, 1] as const

export function ExpertiseSection({ content, services }: { content: ExpertiseContent; services: Service[] }) {
  return (
    <Section className="relative bg-white dark:bg-ink-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid md:grid-cols-12 gap-8 mb-16"
        >
          <div className="md:col-span-5">
            <Eyebrow className="mb-4">{content.pretitle}</Eyebrow>
            <h2 className="font-serif text-h1 text-ink-900 dark:text-white">
              {content.heading}
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex items-end">
            <p className="text-lg text-ink-500 dark:text-ink-300 leading-relaxed">{content.lead}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline rounded-3xl overflow-hidden border border-hairline">
          {services.map((service, idx) => {
            const IconComponent = iconMap[service.icon] || Code
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.06, ease: EASE }}
                className="group relative bg-white dark:bg-ink-900 p-8 md:p-10 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors duration-500 overflow-hidden"
              >
                {/* Spotlight on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-brand" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono text-ink-400">0{idx + 1}</span>
                    <IconComponent className="h-5 w-5 text-brand transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="font-serif text-2xl text-ink-900 dark:text-white mb-3 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-ink-500 dark:text-ink-300 leading-relaxed text-[15px] mb-6">
                    {service.description}
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                  >
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink-900 dark:text-white hover:text-brand transition-colors"
          >
            {content.ctaLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
