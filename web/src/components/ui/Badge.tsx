import { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'outline'

export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-neutral-200 text-neutral-900',
        variant === 'outline' && 'border border-neutral-300 text-neutral-700',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
