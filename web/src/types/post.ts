import type { ID, Timestamp } from './common'

export interface Post {
  id: ID
  title: string
  content: string
  tags: string[]
  userId: ID
  createdAt: Timestamp
  updatedAt: Timestamp
  version?: number
}

export type CreatePostInput = {
  title: string
  content: string
  tags?: string[]
}

export type UpdatePostInput = Partial<CreatePostInput> & {
  // Optionally provide version for optimistic concurrency when available
  version?: number
}
