import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-2 flex items-center justify-between', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-3 flex items-center justify-end gap-2', className)} {...props} />
}
