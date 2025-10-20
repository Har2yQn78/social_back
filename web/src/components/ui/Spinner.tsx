import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent',
        className
      )}
      {...props}
      aria-label="Loading"
    />
  )
}
