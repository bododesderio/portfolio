import { HTMLAttributes } from 'react'

type SectionProps = HTMLAttributes<HTMLElement> & {
  spacing?: 'default' | 'compact' | 'tight'
}

const SPACING: Record<NonNullable<SectionProps['spacing']>, string> = {
  default: 'py-24 md:py-32',
  compact: 'py-16 md:py-20',
  tight: 'py-12 md:py-16',
}

export function Section({ spacing = 'default', className = '', children, ...rest }: SectionProps) {
  return (
    <section className={`${SPACING[spacing]} ${className}`} {...rest}>
      {children}
    </section>
  )
}
