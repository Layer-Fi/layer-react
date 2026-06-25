import { type MutableRefObject, useCallback, useEffect, useState } from 'react'

import { clampPageIndex } from '@hooks/utils/pagination/utils'

type UsePaginationStateProps = {
  pageCount: number
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number) => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}

export function usePaginationState({
  autoResetPageIndexRef,
  pageCount,
  pageIndex,
  onPageIndexChange,
}: UsePaginationStateProps) {
  const [internalPageIndex, setInternalPageIndex] = useState(0)
  const isPaginationControlled = pageIndex !== undefined
  const requestedPageIndex = pageIndex ?? internalPageIndex
  const effectivePageIndex = clampPageIndex({ pageCount, pageIndex: requestedPageIndex })
  const shouldResetPageIndex = autoResetPageIndexRef?.current === true

  const setPage = useCallback((pageIndex: number) => {
    const nextPageIndex = clampPageIndex({ pageCount, pageIndex })

    if (!isPaginationControlled) {
      setInternalPageIndex(nextPageIndex)
    }
    onPageIndexChange?.(nextPageIndex)
  }, [isPaginationControlled, onPageIndexChange, pageCount])

  const onPageChange = useCallback((page: number) => {
    setPage(page - 1)
  }, [setPage])

  useEffect(() => {
    if (shouldResetPageIndex) {
      setPage(0)
      return
    }

    if (requestedPageIndex === effectivePageIndex) return

    if (isPaginationControlled) {
      onPageIndexChange?.(effectivePageIndex)
    }
    else {
      setInternalPageIndex(effectivePageIndex)
    }
  }, [
    effectivePageIndex,
    isPaginationControlled,
    onPageIndexChange,
    requestedPageIndex,
    setPage,
    shouldResetPageIndex,
  ])

  return { onPageChange, pageIndex: effectivePageIndex, setPage }
}
