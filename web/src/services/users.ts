import { api } from '../lib/api'
import { normalizeError } from '../lib/errors'
import type { ID, Post, User } from '../types'

// ---- helpers ----
function toArrayTags(input?: string[] | string | null): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.filter(Boolean)
  return input.split(',').map(t => t.trim()).filter(Boolean)
}

function normalizeUser(raw: any): User {
  return {
    id: raw?.id ?? raw?.userId ?? raw?.user_id,
    username: raw?.username ?? raw?.name ?? '',
    email: raw?.email,
    isActive: Boolean(raw?.isActive ?? raw?.is_active ?? true),
    createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString()
  }
}

function normalizePost(raw: any): Post {
  const id = raw?.id ?? raw?.ID ?? raw?.postId ?? raw?.post_id
  const title = raw?.title ?? ''
  const content = raw?.content ?? ''
  const tags = toArrayTags(raw?.tags ?? raw?.Tags)
  const userId = raw?.userId ?? raw?.user_id ?? raw?.authorId ?? raw?.author_id
  const createdAt = raw?.createdAt ?? raw?.created_at ?? new Date().toISOString()
  const updatedAt = raw?.updatedAt ?? raw?.updated_at ?? createdAt
  return { id, title, content, tags, userId, createdAt, updatedAt }
}

// ---- API calls ----
export async function getUser(userId: ID): Promise<User> {
  try {
    // If there is no explicit endpoint for single user, many APIs expose /users/:id
    const { data } = await api.get(`/users/${userId}`)
    const payload: any = data?.data ?? data
    return normalizeUser(payload?.user ?? payload)
  } catch (err) {
    // Some backends don’t expose GET /users/:id.
    // Fall back to constructing a minimal user object so the page still renders.
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to load user')
  }
}

export async function getUserPosts(userId: ID): Promise<Post[]> {
  try {
    // Some projects expose /users/:id/posts, others filter on feed — try the common path first
    const { data } = await api.get(`/users/${userId}/posts`)
    const payload: any = data?.data ?? data
    const list = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.posts) ? payload.posts : payload
    return (Array.isArray(list) ? list : []).map(normalizePost)
  } catch (err) {
    // Fallback: query the feed with user filter if your backend supports it (adjust as needed)
    // If not supported, surface the backend error.
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to load posts for user')
  }
}

export async function followUser(userId: ID): Promise<void> {
  try {
    await api.put(`/users/${userId}/follow`)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to follow user')
  }
}

export async function unfollowUser(userId: ID): Promise<void> {
  try {
    await api.put(`/users/${userId}/unfollow`)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to unfollow user')
  }
}

export async function listFollowers(userId: ID): Promise<User[]> {
  try {
    const { data } = await api.get(`/users/${userId}/followers`)
    const payload: any = data?.data ?? data
    const list = Array.isArray(payload?.items) ? payload.items : payload
    return (Array.isArray(list) ? list : []).map(normalizeUser)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to load followers')
  }
}

export async function listFollowing(userId: ID): Promise<User[]> {
  try {
    const { data } = await api.get(`/users/${userId}/following`)
    const payload: any = data?.data ?? data
    const list = Array.isArray(payload?.items) ? payload.items : payload
    return (Array.isArray(list) ? list : []).map(normalizeUser)
  } catch (err) {
    const e = normalizeError(err)
    throw new Error(e.message || 'Failed to load following')
  }
}
