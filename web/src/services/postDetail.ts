import { api } from '../lib/api'
import { normalizeError } from '../lib/errors'
import type { Comment, CreateCommentInput, Post } from '../types'

// reuse logic to normalize tags/fields
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
  return { id, title, content, tags, userId, createdAt, updatedAt }
}

function normalizeComment(raw: any): Comment {
  return {
    id: raw?.id ?? raw?.ID ?? raw?.commentId ?? raw?.comment_id,
    postId: raw?.postId ?? raw?.post_id,
    userId: raw?.userId ?? raw?.user_id,
    content: raw?.content ?? '',
    createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString()
  }
}

export async function getPostWithComments(postId: string | number): Promise<{ post: Post; comments: Comment[] }> {
  try {
    const { data } = await api.get(`/posts/${postId}`)
    const payload: any = data?.data ?? data
    const raw = payload?.post ?? payload
    const post = normalizePost(raw)
    const commentsRaw = raw?.comments ?? payload?.comments ?? []
    const comments = Array.isArray(commentsRaw) ? commentsRaw.map(normalizeComment) : []
    return { post, comments }
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}

export async function addComment(postId: string | number, input: CreateCommentInput): Promise<Comment> {
  try {
    const { data } = await api.post(`/posts/${postId}/comments`, input)
    const payload: any = data?.data ?? data
    const raw = payload?.comment ?? payload
    return normalizeComment(raw)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message)
  }
}
