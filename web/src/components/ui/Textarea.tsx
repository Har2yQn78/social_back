import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          'disabled:cursor-not-allowed disabled:bg-neutral-100',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
