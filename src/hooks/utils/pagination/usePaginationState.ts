import { type MutableRefObject, useCallback, useEffect, useState } from 'react'

type UsePaginationStateProps = {
  pageCount: number
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number) => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}

const clampPageIndex = (pageIndex: number, pageCount: number) => {
  return Math.max(0, Math.min(pageIndex, pageCount - 1))
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
  const effectivePageIndex = clampPageIndex(requestedPageIndex, pageCount)

  const setPage = useCallback((pageIndex: number) => {
    const nextPageIndex = clampPageIndex(pageIndex, pageCount)

    if (!isPaginationControlled) {
      setInternalPageIndex(nextPageIndex)
    }
    onPageIndexChange?.(nextPageIndex)
  }, [isPaginationControlled, onPageIndexChange, pageCount])

  const onPageChange = useCallback((page: number) => {
    setPage(page - 1)
  }, [setPage])

  useEffect(() => {
    if (autoResetPageIndexRef?.current) {
      setPage(0)
      return
    }

    if (requestedPageIndex === effectivePageIndex) {
      return
    }

    if (isPaginationControlled) {
      onPageIndexChange?.(effectivePageIndex)
    }
    else {
      setInternalPageIndex(effectivePageIndex)
    }
  }, [
    autoResetPageIndexRef,
    effectivePageIndex,
    isPaginationControlled,
    onPageIndexChange,
    requestedPageIndex,
    setPage,
  ])

  return {
    onPageChange,
    pageIndex: effectivePageIndex,
    setPage,
  }
}
