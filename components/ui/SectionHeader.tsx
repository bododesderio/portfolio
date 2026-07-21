import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'

/**
 * The Eyebrow + heading pair repeated at the top of most sections. Defaults
 * match the common slate-palette section title; pass `headingClassName` /
 * `eyebrowClassName` where a section needs different size, colour, or spacing.
 */
interface SectionHeaderProps {
  eyebrow: ReactNode
  heading: ReactNode
  as?: 'h1' | 'h2'
  eyebrowClassName?: string
  headingClassName?: string
}

const DEFAULT_HEADING = 'font-serif text-4xl md:text-5xl text-slate-900 dark:text-white'

export function SectionHeader({
  eyebrow,
  heading,
  as: Heading = 'h2',
  eyebrowClassName = 'mb-2',
  headingClassName = DEFAULT_HEADING,
}: SectionHeaderProps) {
  return (
    <>
      <Eyebrow className={eyebrowClassName}>{eyebrow}</Eyebrow>
      <Heading className={headingClassName}>{heading}</Heading>
    </>
  )
}
