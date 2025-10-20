import { cn } from '../../lib/cn'
import { Button } from './Button'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < pages

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-neutral-600">
        Page <span className="font-medium text-neutral-900">{page}</span> of {pages}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
          Prev
        </Button>
        <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={!canNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
