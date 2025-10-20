export type ID = number | string

export type SortOrder = 'asc' | 'desc'

export type PageParams = {
  limit?: number
  offset?: number
  sort?: SortOrder
  search?: string
  tags?: string[]
}

export type Timestamp = string 
