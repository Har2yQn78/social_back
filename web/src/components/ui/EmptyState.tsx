import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn'

export function EmptyState({
  className,
  title = 'Nothing here yet',
  description,
  action,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center',
        className
      )}
      {...props}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-neutral-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
