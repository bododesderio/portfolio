import { HTMLAttributes } from 'react'

export function Eyebrow({ className = '', children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-brand text-sm uppercase tracking-widest ${className}`} {...rest}>
      {children}
    </p>
  )
}
