'use client'

import { motion } from 'framer-motion'
import { Heart, Lightbulb, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

interface ValuesSectionProps {
  values: Array<{ title: string; description: string; icon?: string }>
}

const iconMap: Record<string, React.ElementType> = {
  heart: Heart,
  lightbulb: Lightbulb,
  users: Users,
}

export function ValuesSection({ values }: ValuesSectionProps) {
  if (!values.length) return null

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
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">Values</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => {
            const IconComponent = iconMap[value.icon || 'heart'] || Heart
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 bg-white dark:bg-slate-800 rounded-2xl text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-brand/10 rounded-full">
                  <IconComponent className="h-6 w-6 text-brand" />
                </div>
                <h3 className="font-serif text-xl text-slate-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{value.description}</p>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
