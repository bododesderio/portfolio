'use client'

import { motion } from 'framer-motion'

interface MissionStatementProps {
  text: string
}

export function MissionStatement({ text }: MissionStatementProps) {
  if (!text) return null
  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl md:text-5xl text-fg leading-relaxed"
        >
          {text}
        </motion.p>
      </div>
    </section>
  )
}
