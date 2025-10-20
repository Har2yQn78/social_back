import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-neutral-900 placeholder-neutral-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
        'disabled:cursor-not-allowed disabled:bg-neutral-100',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'
