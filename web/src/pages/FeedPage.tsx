import { useEffect, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchFeed } from '../services/posts'
import type { SortOrder } from '../types'
import { Button, Card, CardContent, Input, Label, Select, Spinner } from '../components/ui'
import PostCard from '../components/posts/PostCard'
import { useDebounce } from '../lib/useDebounce'

const PAGE_SIZE = 10

export default function FeedPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState('') // comma-separated
  const [sort, setSort] = useState<SortOrder>('desc')

  const offset = useMemo(() => (page - 1) * PAGE_SIZE, [page])
  const debouncedSearch = useDebounce(search, 400)
  const debouncedTags = useDebounce(tags, 400)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['feed', { page, search: debouncedSearch, tags: debouncedTags, sort }],
    queryFn: () =>
      fetchFeed({
        limit: PAGE_SIZE,
        offset,
        sort,
        search: debouncedSearch || undefined,
        tags:
          debouncedTags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean) || undefined
      }),
      placeholderData: keepPreviousData
  })

  // If filters change, reset to page 1
  useEffect(() => {
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedTags, sort])

  const items = data?.items ?? []
  const total = data?.total
  const hasNext = typeof total === 'number' ? page * PAGE_SIZE < total : items.length >= PAGE_SIZE
  const hasPrev = page > 1

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Your feed</h1>

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="go, database, api"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-500">Comma-separated. Matches any of them.</p>
          </div>
          <div>
            <Label htmlFor="sort">Sort</Label>
            <Select id="sort" value={sort} onChange={e => setSort(e.target.value as SortOrder)}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => refetch()} className="w-full">
              Refresh {isFetching ? <span className="ml-2 inline-flex"><Spinner /></span> : null}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner /> <span>Loading feed…</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {(error as Error)?.message || 'Failed to load feed'}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold">No posts found</h3>
          <p className="mt-1 text-neutral-600">Try adjusting your filters or create a post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => (
            <PostCard key={String(p.id)} post={p} />
          ))}
        </div>
      )}

      {/* Pager */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Page <span className="font-medium text-neutral-900">{page}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!hasPrev}>
            Prev
          </Button>
          <Button variant="secondary" onClick={() => setPage(p => (hasNext ? p + 1 : p))} disabled={!hasNext}>
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}
