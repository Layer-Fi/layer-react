import { type MutableRefObject, useMemo } from 'react'

import { usePaginationState } from '@hooks/utils/pagination/usePaginationState'
import { getPageCount, getPageItems } from '@hooks/utils/pagination/utils'

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
  const pageCount = getPageCount({ itemCount: data.length, pageSize })
  const paginationState = usePaginationState({
    autoResetPageIndexRef,
    pageCount,
    pageIndex,
    onPageIndexChange,
  })

  const pageItems = useMemo(() => {
    return getPageItems({ data, pageIndex: paginationState.pageIndex, pageSize })
  }, [data, pageSize, paginationState.pageIndex])

  return {
    ...paginationState,
    pageCount,
    pageItems,
  }
}
