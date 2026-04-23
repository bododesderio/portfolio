'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Briefcase, Award, ChevronDown, ChevronUp } from 'lucide-react'

interface TimelineItem {
  year?: string
  title: string
  organization?: string
  description?: string
  icon?: 'calendar' | 'briefcase' | 'award'
}

interface TimelineSectionProps {
  items: TimelineItem[]
}

const MOBILE_DEFAULT_COUNT = 3

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  briefcase: Briefcase,
  award: Award,
}

export function TimelineSection({ items }: TimelineSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (!items.length) return null

  const hasMore = items.length > MOBILE_DEFAULT_COUNT
  const visibleItems = expanded ? items : items.slice(0, MOBILE_DEFAULT_COUNT)

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">
            The Story So Far
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Every chapter shaped the next — from restless curiosity to building things that matter.
            Here is how the journey has unfolded.
          </p>
        </motion.div>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4">
          {/* On mobile: show limited items; on md+: always show all */}
          <div className="hidden md:block">
            {items.map((item, idx) => (
              <TimelineEntry key={idx} item={item} idx={idx} />
            ))}
          </div>

          <div className="md:hidden">
            <AnimatePresence initial={false}>
              {visibleItems.map((item, idx) => (
                <motion.div
                  key={`mobile-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <TimelineEntry item={item} idx={idx} />
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pl-8"
              >
                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-brand font-semibold text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineEntry({ item, idx }: { item: TimelineItem; idx: number }) {
  const IconComponent = iconMap[item.icon || 'calendar'] || Calendar
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      className="mb-12 pl-8 relative"
    >
      <div className="absolute -left-4 top-0 w-8 h-8 bg-brand rounded-full flex items-center justify-center">
        <IconComponent className="h-4 w-4 text-white" />
      </div>
      {item.year && <p className="text-brand text-sm font-semibold mb-1">{item.year}</p>}
      <h3 className="font-serif text-2xl text-slate-900 dark:text-white">{item.title}</h3>
      {item.organization && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">{item.organization}</p>
      )}
      {item.description && (
        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
          {item.description}
        </p>
      )}
    </motion.div>
  )
}
