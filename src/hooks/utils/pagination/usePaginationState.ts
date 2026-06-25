import { type MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'

import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { clampPageIndex } from '@hooks/utils/pagination/utils'

type UsePaginationStateProps = {
  pageCount: number
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number, source: PaginationChangeSource) => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
  data: unknown
}

export function usePaginationState({
  autoResetPageIndexRef,
  data,
  pageCount,
  pageIndex,
  onPageIndexChange,
}: UsePaginationStateProps) {
  const [internalPageIndex, setInternalPageIndex] = useState(0)

  const isPaginationControlled = pageIndex !== undefined
  const requestedPageIndex = pageIndex ?? internalPageIndex

  const previousDataRef = useRef(data)
  const dataHasChanged = previousDataRef.current !== data

  const hasPendingAutoReset = autoResetPageIndexRef?.current === true
  const shouldResetPageIndex = hasPendingAutoReset && dataHasChanged
  const clampedPageIndex = clampPageIndex({ pageCount, pageIndex: requestedPageIndex })
  const effectivePageIndex = shouldResetPageIndex ? 0 : clampedPageIndex

  const syncPageIndex = useCallback((pageIndex: number, source: PaginationChangeSource) => {
    if (!isPaginationControlled) {
      setInternalPageIndex(pageIndex)
    }

    onPageIndexChange?.(pageIndex, source)
  }, [isPaginationControlled, onPageIndexChange])

  const setPage = useCallback((pageIndex: number, source: PaginationChangeSource) => {
    const nextPageIndex = clampPageIndex({ pageCount, pageIndex })

    syncPageIndex(nextPageIndex, source)
  }, [pageCount, syncPageIndex])

  const onPageChange = useCallback((page: number) => {
    setPage(page - 1, PaginationChangeSource.User)
  }, [setPage])

  useEffect(() => {
    if (dataHasChanged) {
      previousDataRef.current = data
    }

    if (requestedPageIndex === effectivePageIndex) return

    syncPageIndex(effectivePageIndex, PaginationChangeSource.Sync)
  }, [
    data,
    dataHasChanged,
    effectivePageIndex,
    requestedPageIndex,
    syncPageIndex,
  ])

  return { onPageChange, pageIndex: effectivePageIndex, setPage }
}
