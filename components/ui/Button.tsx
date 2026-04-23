import Link from 'next/link'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

type Variant = 'primary' | 'outline-light' | 'outline-dark' | 'invert' | 'ghost' | 'glass'
type Size = 'sm' | 'md' | 'lg'

const BASE =
  'group relative inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-900 ' +
  'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-600 hover:shadow-glow-brand shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_1px_12px_-2px_rgba(201,168,76,0.35)]',
  'outline-light':
    'border border-white/25 text-white hover:border-white/60 hover:bg-white/5 backdrop-blur-sm',
  'outline-dark':
    'border border-hairline text-ink-900 dark:text-ink-50 hover:border-brand/60 hover:bg-brand/5',
  invert:
    'bg-white text-ink-900 hover:bg-ink-50 shadow-sm',
  ghost:
    'text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800',
  glass:
    'glass text-ink-900 dark:text-ink-50 hover:bg-brand/10',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-[15px]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  icon?: ReactNode
}

type ButtonAsLink = CommonProps & {
  href: string
  type?: never
  onClick?: never
  disabled?: never
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined
  }

type ButtonProps = ButtonAsLink | ButtonAsButton

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', className = '', children, icon, ...rest },
  ref,
) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  const content = (
    <>
      <span className="relative z-[1] flex items-center gap-2">
        {children}
        {icon}
      </span>
    </>
  )

  if ('href' in rest && rest.href) {
    const { href } = rest
    const isExternal = /^https?:\/\//i.test(href)
    if (isExternal) {
      return (
        <a
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      )
    }
    return (
      <Link href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...(rest as ButtonAsButton)}
    >
      {content}
    </button>
  )
})
