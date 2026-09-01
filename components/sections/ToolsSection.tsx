'use client'

import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import {
  SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiPostgresql,
  SiPrisma, SiTailwindcss, SiDocker, SiGit,
} from 'react-icons/si'
import { FaAws } from 'react-icons/fa'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/SectionHeader'

const tools: { name: string; Icon: IconType }[] = [
  { name: 'React', Icon: SiReact },
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'Node.js', Icon: SiNodedotjs },
  { name: 'PostgreSQL', Icon: SiPostgresql },
  { name: 'Prisma', Icon: SiPrisma },
  { name: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'AWS', Icon: FaAws },
  { name: 'Docker', Icon: SiDocker },
  { name: 'Git', Icon: SiGit },
]

export function ToolsSection() {
  return (
    <section className="py-24 bg-surface-2 dark:bg-ink-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <SectionHeader eyebrow="Tools & Stack" heading="Technologies I work with" />
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
              <tool.Icon aria-hidden className="mb-2 h-9 w-9 text-ink-700 dark:text-slate-200" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tool.name}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
