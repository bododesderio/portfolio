'use client'

import { motion } from 'framer-motion'
import { Search, Map, Code, TrendingUp } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface Step {
  icon: string
  title: string
  desc: string
}

interface ProcessContent {
  pretitle: string
  heading: string
  steps: Step[]
}

const iconMap: Record<string, React.ElementType> = {
  search: Search,
  map: Map,
  code: Code,
  'trending-up': TrendingUp,
}

export function ProcessSection({ content }: { content: ProcessContent }) {
  const { pretitle, heading, steps } = content

  return (
    <Section>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Eyebrow className="mb-2">{pretitle}</Eyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">
            {heading}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const IconComponent = iconMap[step.icon] || Code
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                  <IconComponent className="h-6 w-6 text-brand" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
