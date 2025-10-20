import { api } from '../lib/api'
import type { PageParams, Post, CreatePostInput, UpdatePostInput } from '../types'
import { normalizeError } from '../lib/errors'

export type FeedResult = {
  items: Post[]
  total?: number
}

// ---- helpers ----
function toArrayTags(input?: string[] | string | null): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.filter(Boolean)
  return input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

function normalizePost(raw: any): Post {
  const id = raw?.id ?? raw?.ID ?? raw?.postId ?? raw?.post_id
  const title = raw?.title ?? ''
  const content = raw?.content ?? ''
  const tags = toArrayTags(raw?.tags ?? raw?.Tags)
  const userId = raw?.userId ?? raw?.user_id ?? raw?.authorId ?? raw?.author_id
  const createdAt =
    raw?.createdAt ?? raw?.created_at ?? raw?.CreatedAt ?? new Date().toISOString()
  const updatedAt =
    raw?.updatedAt ?? raw?.updated_at ?? raw?.UpdatedAt ?? createdAt
  // no version use — backend doesn’t accept it
  return { id, title, content, tags, userId, createdAt, updatedAt }
}

// ---- queries ----
export async function fetchFeed(params: PageParams = {}): Promise<FeedResult> {
  try {
    const { limit = 10, offset = 0, sort = 'desc', search, tags } = params
    const { data } = await api.get('/users/feed', {
      params: {
        limit,
        offset,
        sort,
        search,
        ...(tags && tags.length ? { tags: tags.join(',') } : {})
      }
    })

    const payload: any = data?.data ?? data
    if (Array.isArray(payload)) {
      return { items: payload.map(normalizePost), total: undefined }
    }
    if (payload?.items && Array.isArray(payload.items)) {
      return {
        items: payload.items.map(normalizePost),
        total: typeof payload.total === 'number' ? payload.total : undefined
      }
    }
    if (payload?.posts && Array.isArray(payload.posts)) {
      return {
        items: payload.posts.map(normalizePost),
        total: typeof payload.total === 'number' ? payload.total : undefined
      }
    }
    return { items: [], total: undefined }
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}

export async function getPost(id: string | number): Promise<Post> {
  try {
    const { data } = await api.get(`/posts/${id}`)
    const payload: any = data?.data ?? data
    return normalizePost(payload?.post ?? payload)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  try {
    const body = {
      title: input.title,
      content: input.content,
      tags: input.tags ?? []
    }
    const { data } = await api.post('/posts', body)
    const payload: any = data?.data ?? data
    return normalizePost(payload?.post ?? payload)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}

export async function updatePost(id: string | number, input: UpdatePostInput): Promise<Post> {
  try {
    const body: any = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {})
    }
    const { data } = await api.patch(`/posts/${id}`, body)
    const payload: any = data?.data ?? data
    return normalizePost(payload?.post ?? payload)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}
