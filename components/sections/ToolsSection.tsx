'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

const tools = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'TypeScript', icon: 'TS' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Prisma', icon: '🔺' },
  { name: 'Tailwind CSS', icon: '🌊' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Git', icon: '📦' },
]

export function ToolsSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Eyebrow className="mb-2">Tools & Stack</Eyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">
            Technologies I work with
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {tools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl mb-2">{tool.icon}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{tool.name}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
