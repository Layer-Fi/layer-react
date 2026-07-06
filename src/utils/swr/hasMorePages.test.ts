import { describe, expect, it } from 'vitest'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { hasMorePages } from '@utils/swr/hasMorePages'

const page = (
  pagination?: { hasMore: boolean, cursor?: string | null },
): PaginatedResponse<unknown> => ({
  data: [],
  meta: pagination
    ? { pagination: { hasMore: pagination.hasMore, cursor: pagination.cursor ?? null, totalCount: 0 } }
    : undefined,
})

describe('hasMorePages', () => {
  it('returns false when pages is undefined', () => {
    expect(hasMorePages(undefined)).toBe(false)
  })

  it('returns false when there are no pages', () => {
    expect(hasMorePages([])).toBe(false)
  })

  it('returns true when the last page has both hasMore and a cursor', () => {
    expect(hasMorePages([page({ hasMore: true, cursor: 'next' })])).toBe(true)
  })

  it('returns false when the last page has hasMore but no cursor', () => {
    expect(hasMorePages([page({ hasMore: true, cursor: null })])).toBe(false)
  })

  it('returns false when the last page reports hasMore false', () => {
    expect(hasMorePages([page({ hasMore: false, cursor: 'next' })])).toBe(false)
  })

  it('only considers the last page', () => {
    const pages = [
      page({ hasMore: true, cursor: 'next' }),
      page({ hasMore: false, cursor: null }),
    ]
    expect(hasMorePages(pages)).toBe(false)
  })

  it('returns false when the last page has no pagination meta', () => {
    expect(hasMorePages([page()])).toBe(false)
  })
})
