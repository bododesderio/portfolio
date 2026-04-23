'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Stat {
  value: string
  suffix: string
  label: string
}

interface StatsSectionProps {
  stats: Stat[]
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative bg-ink-900 text-white border-y border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-white/10">
          {stats.map((stat, idx) => (
            <StatItem key={idx} stat={stat} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, idx }: { stat: Stat; idx: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [count, setCount] = useState(0)
  const target = parseInt(stat.value, 10) || 0

  useEffect(() => {
    if (!isInView || target === 0) return
    const duration = 1500
    const steps = 48
    const increment = target / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setCount(Math.min(target, Math.floor(increment * step)))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 py-10 md:py-12 group relative overflow-hidden"
    >
      {/* Subtle hover spotlight */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-brand" />

      <div className="relative flex items-baseline gap-1 font-serif tabular text-white">
        <span className="text-5xl md:text-6xl tracking-tight">
          {count}
        </span>
        <span className="text-xl md:text-2xl text-brand-300">{stat.suffix}</span>
      </div>
      <p className="relative mt-3 text-[11px] uppercase tracking-brand text-white/50">
        {stat.label}
      </p>
      <p className="relative mt-4 text-[10px] text-white/25 font-mono">0{idx + 1}</p>
    </motion.div>
  )
}
