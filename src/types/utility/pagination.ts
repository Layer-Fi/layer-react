import { pipe, Schema } from 'effect'

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',

  /**
   * @deprecated Use SortOrder.ASC instead
   */
  ASCENDING = 'ASCENDING',
  /**
   * @deprecated Use SortOrder.DESC instead
   */
  DES = 'DES',
  /**
   * @deprecated Use SortOrder.DESC instead
   */
  DESCENDING = 'DESCENDING',
}

export type SortParams<T> = {
  sortBy?: T
  sortOrder?: SortOrder
}

export type PaginationParams = {
  cursor?: string | null
  limit?: number
  showTotalCount?: boolean
}

export function getNextSortOrder(currentSortOrder: SortOrder): SortOrder {
  return currentSortOrder === SortOrder.ASC || currentSortOrder === SortOrder.ASCENDING ? SortOrder.DESC : SortOrder.ASC
}

export const PaginatedResponseMetaSchema = Schema.Struct({
  cursor: Schema.NullOr(Schema.String),

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
