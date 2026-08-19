import type { PaginatedResponse } from '@schemas/common/pagination'

export function hasMorePages(pages: ReadonlyArray<PaginatedResponse<unknown>> | undefined) {
  const pagination = pages?.at(-1)?.meta?.pagination
  return Boolean(pagination?.hasMore && pagination.cursor)
}
