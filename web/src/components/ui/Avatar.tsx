import { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Props = HTMLAttributes<HTMLDivElement> & {
  src?: string
  alt?: string
  name?: string
  size?: number // px
}

export function Avatar({ src, alt, name, size = 36, className, ...props }: Props) {
  const initials =
    (name || alt || '?')
      .split(' ')
      .map(s => s.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || '?'

  return (
    <div
      className={cn(
        'inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-neutral-700',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.35) }}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  )
}
