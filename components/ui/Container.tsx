import { HTMLAttributes } from 'react'

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'default' | 'narrow' | 'wide'
}

const SIZES: Record<NonNullable<ContainerProps['size']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-screen-2xl',
}

export function Container({ size = 'default', className = '', children, ...rest }: ContainerProps) {
  return (
    <div className={`${SIZES[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
      {children}
    </div>
  )
}
