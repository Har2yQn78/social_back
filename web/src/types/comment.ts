import type { ID, Timestamp } from './common'

export interface Comment {
  id: ID
  postId: ID
  userId: ID
  content: string
  createdAt: Timestamp
}

export type CreateCommentInput = {
  content: string
}
