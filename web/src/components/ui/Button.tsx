import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
}

const sizeMap: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
}

const variantMap: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60 disabled:text-white',
  secondary:
    'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 disabled:text-neutral-600',
  ghost:
    'bg-transparent text-neutral-800 hover:bg-neutral-100 disabled:text-neutral-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60 disabled:text-white'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', block, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark disabled:cursor-not-allowed',
          sizeMap[size],
          variantMap[variant],
          block && 'w-full',
          loading && 'opacity-80',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
