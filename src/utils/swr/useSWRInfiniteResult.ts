import { useCallback, useMemo, useRef } from 'react'
import type { SWRInfiniteResponse } from 'swr/infinite'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { hasMorePages } from '@utils/swr/hasMorePages'
import { type FlattenedData, SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'

/**
 * Wraps a useSWRInfinite response in an SWRInfiniteResult, memoizing the flattened pages so
 * `flattenedData` and `fetchMore` are stable references across renders (until the underlying
 * SWR data changes). Scoped to the calling component rather than a module-level cache.
 */
export function useSWRInfiniteResult<T extends PaginatedResponse<unknown>>(
  swrResponse: SWRInfiniteResponse<T>,
) {
  const { data: pages, setSize } = swrResponse

  const flattenedData = useMemo(
    () => pages?.flatMap(page => page.data) as FlattenedData<T> | undefined,
    [pages],
  )

  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const fetchMore = useCallback(() => {
    if (hasMorePages(pagesRef.current)) {
      void setSize(size => size + 1)
    }
  }, [setSize])

  return new SWRInfiniteResult(swrResponse, flattenedData, fetchMore)
}
