import { useMemo } from 'react'
import type { SWRInfiniteResponse } from 'swr/infinite'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { type FlattenedData, SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'

/**
 * Wraps a useSWRInfinite response in an SWRInfiniteResult, memoizing the flattened pages so
 * `flattenedData` is a stable reference across renders (until the underlying SWR data changes).
 * Scoped to the calling component rather than a module-level cache.
 */
export function useSWRInfiniteResult<T extends PaginatedResponse<unknown>>(
  swrResponse: SWRInfiniteResponse<T>,
) {
  const { data: pages } = swrResponse

  const flattenedData = useMemo(
    () => pages?.flatMap(page => page.data) as FlattenedData<T> | undefined,
    [pages],
  )

  return new SWRInfiniteResult(swrResponse, flattenedData)
}
