'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'

interface BioContent {
  heading: string
  body: string
  pullquote: string
  roles: Array<{ title: string; org: string; period: string }>
}

export function BioSection({ content }: { content: BioContent }) {
  const [expanded, setExpanded] = useState(false)
  const roleHighlights = content.roles.slice(0, 4)

  return (
    <Section className="bg-surface" spacing="compact">
      <Container className="max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1.15fr)_20rem] xl:gap-16">
            <div>
              <Eyebrow className="mb-4">Profile</Eyebrow>
              <h2 className="mb-6 font-serif text-4xl text-fg md:text-5xl">
                {content.heading}
              </h2>

              {roleHighlights.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2.5">
                  {roleHighlights.map((role, idx) => (
                    <span
                      key={`${role.title}-${idx}`}
                      className="inline-flex items-center rounded-full border border-hairline bg-card px-3.5 py-1.5 text-xs font-medium text-fg-muted"
                    >
                      {role.title}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`relative max-w-3xl ${
                  !expanded ? 'max-h-[380px] overflow-hidden md:max-h-none' : ''
                }`}
              >
                <div
                  className="prose prose-lg max-w-none text-fg-muted dark:prose-invert prose-headings:text-fg prose-p:leading-[1.95] prose-p:text-fg-muted prose-a:text-brand prose-a:no-underline hover:prose-a:text-brand-600 prose-strong:text-fg"
                  dangerouslySetInnerHTML={{ __html: content.body }}
                />

                {!expanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent md:hidden" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-600 md:hidden"
              >
                {expanded ? 'Show less' : 'Read the full story'}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <aside className="self-start space-y-5 xl:sticky xl:top-24">
              <div className="rounded-[20px] border border-hairline bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl text-fg">Roles</h3>
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    At a glance
                  </span>
                </div>
                <ul className="space-y-5">
                  {content.roles.map((role, idx) => (
                    <li key={idx} className="border-l-2 border-brand/80 pl-4">
                      <p className="font-medium text-fg">{role.title}</p>
                      <p className="mt-1 text-fg-muted">{role.org}</p>
                      <p className="mt-1 text-sm text-ink-500">{role.period}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {content.pullquote && (
                <blockquote className="rounded-[20px] border border-hairline bg-surface-2 p-6 font-serif text-2xl italic leading-tight text-fg shadow-sm md:text-[2rem]">
                  <span className="block border-l-4 border-brand pl-5">
                    {content.pullquote}
                  </span>
                </blockquote>
              )}
            </aside>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
