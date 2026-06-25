import { type MutableRefObject, useMemo } from 'react'

import { usePaginationState } from '@hooks/utils/pagination/usePaginationState'

type UsePaginatedListProps<T> = {
  data: ReadonlyArray<T>
  pageSize: number
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number) => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}

export function usePaginatedList<T>({
  autoResetPageIndexRef,
  data,
  pageSize,
  pageIndex,
  onPageIndexChange,
}: UsePaginatedListProps<T>) {
  const pageCount = Math.max(0, Math.ceil(data.length / pageSize))
  const {
    onPageChange,
    pageIndex: currentPageIndex,
    setPage,
  } = usePaginationState({
    autoResetPageIndexRef,
    pageCount,
    pageIndex,
    onPageIndexChange,
  })

  const pageItems = useMemo(() => {
    return data.slice(
      currentPageIndex * pageSize,
      (currentPageIndex + 1) * pageSize,
    )
  }, [currentPageIndex, data, pageSize])

  return {
    onPageChange,
    pageCount,
    pageIndex: currentPageIndex,
    pageItems,
    setPage,
  }
}
