'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { HeroPortrait } from './HeroPortrait'

interface HeroContent {
  pretitle: string
  headline: string
  tagline: string
  ctaPrimaryLabel: string
  ctaPrimaryUrl: string
  ctaSecondaryLabel: string
  ctaSecondaryUrl: string
  photo: string
  backgroundImage?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

function splitFirstTwo(s: string): { first: string; rest: string } {
  const trimmed = s.trim()
  const idx = trimmed.indexOf(' ')
  if (idx === -1) return { first: trimmed, rest: '' }
  return { first: trimmed.slice(0, idx), rest: trimmed.slice(idx + 1) }
}

export function HeroSection({ content }: { content: HeroContent }) {
  const { first, rest } = splitFirstTwo(content.headline)

  return (
    <section className="relative overflow-hidden bg-surface">
      {/* Layered background — generic image + gradients */}
      <div aria-hidden className="absolute inset-0">
        {content.backgroundImage && (
          <>
            <Image
              src={content.backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-surface/80 dark:bg-surface/85" />
          </>
        )}
        <div className="absolute inset-0 bg-radial-brand opacity-60 dark:opacity-90" />
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark bg-grid-lg opacity-[0.25] dark:opacity-[0.22] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent_70%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-surface" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28 lg:py-36">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left — text */}
          <div className="order-2 lg:order-1 text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mb-8"
            >
              <div className="glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs tracking-wide text-fg">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {content.pretitle}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, filter: 'blur(8px)', y: 24 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.08 }}
              className="font-serif text-display-xl text-fg"
            >
              <span className="block">{first}</span>
              {rest && (
                <span className="block italic text-brand dark:text-brand-300">
                  {rest}
                </span>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl leading-relaxed text-fg-muted max-w-xl"
            >
              {content.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.32 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Button
                href={content.ctaPrimaryUrl}
                variant="primary"
                size="lg"
                className="ring-halo"
                icon={<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              >
                {content.ctaPrimaryLabel}
              </Button>
              <Button
                href={content.ctaSecondaryUrl}
                variant="outline-dark"
                size="lg"
                icon={<Sparkles className="h-4 w-4 text-brand" />}
              >
                {content.ctaSecondaryLabel}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-brand text-fg-muted"
            >
              <span>Kampala, Uganda</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-fg-muted/50" />
              <span>Rooibok Technologies</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-fg-muted/50" />
              <span>Kakebe Technologies</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-fg-muted/50" />
              <span>Former AYC President</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.15 }}
            className="order-1 lg:order-2 max-h-[320px] lg:max-h-none overflow-hidden lg:overflow-visible"
          >
            <HeroPortrait photo={content.photo || undefined} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
