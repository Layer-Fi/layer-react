export interface PaginationMetadata {
  sort_by?: string
  sort_order: string
  cursor?: string
  has_more: boolean
}

export type Metadata = {
  pagination?: PaginationMetadata
}
