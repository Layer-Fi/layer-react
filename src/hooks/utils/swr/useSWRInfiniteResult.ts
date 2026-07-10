import { useCallback, useMemo } from 'react'
import type { SWRInfiniteResponse } from 'swr/infinite'

import { type FlattenedData, SWRInfiniteResult } from '@internal-types/swr/SWRResponseTypes'
import type { PaginatedResponse } from '@schemas/common/pagination'
import { hasMorePages } from '@utils/swr/hasMorePages'
import { useLatestRef } from '@hooks/utils/react/useLatestRef'

/**
 * Wraps a useSWRInfinite response in an SWRInfiniteResult, memoizing the flattened pages so
 * `flattenedData` and `fetchMore` are stable references across renders (until the underlying
 * SWR data changes). Scoped to the calling component rather than a module-level cache.
 */
export function useSWRInfiniteResult<T extends PaginatedResponse<unknown>>(
  swrResponse: SWRInfiniteResponse<T>,
) {
  const { data: pages, setSize } = swrResponse

  const pagesRef = useLatestRef(pages)

  const fetchMore = useCallback(() => {
    if (hasMorePages(pagesRef.current)) {
      void setSize(size => size + 1)
    }
  }, [setSize, pagesRef])

  const flattenedData = useMemo(
    () => pages?.flatMap(page => page.data) as FlattenedData<T> | undefined,
    [pages],
  )

  return new SWRInfiniteResult(swrResponse, fetchMore, flattenedData)
}
