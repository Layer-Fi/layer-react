import type { PaginatedResponse } from '@schemas/common/pagination'

export function hasMorePages(pages: ReadonlyArray<PaginatedResponse<unknown>> | undefined) {
  if (!pages || pages.length === 0) {
    return false
  }
  const pagination = pages[pages.length - 1].meta?.pagination
  return Boolean(pagination?.hasMore && pagination.cursor)
}
