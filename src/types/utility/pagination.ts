import { Schema, pipe } from 'effect'

enum SortOrder {
  ASC = 'ASC',
  ASCENDING = 'ASCENDING',
  DES = 'DES',
  DESC = 'DESC',
  DESCENDING = 'DESCENDING',
}

export type SortParams<T> = {
  sort_by?: T
  sort_order?: SortOrder
}

export type PaginationParams = {
  cursor?: string
  limit?: number
  show_total_count?: boolean
}

export const PaginatedResponseMetaSchema = Schema.Struct({
  cursor: Schema.UndefinedOr(Schema.String),

  hasMore: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('has_more'),
  ),

  totalCount: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.Number)),
    Schema.fromKey('total_count'),
  ),
})

export type PaginatedResponseMeta = typeof PaginatedResponseMetaSchema.Type
