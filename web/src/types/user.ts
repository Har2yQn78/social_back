import type { ID, Timestamp } from './common'

export interface User {
  id: ID
  username: string
  email?: string
  createdAt: Timestamp
  isActive: boolean
}

export interface FollowRelation {
  userId: ID
  followerId: ID
}
