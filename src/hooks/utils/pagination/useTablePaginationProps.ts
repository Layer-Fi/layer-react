import { useMemo } from 'react'

import { type TablePaginationProps } from '@internal-types/utility/pagination'
import type { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { useAutoResetPageIndex } from '@hooks/utils/pagination/useAutoResetPageIndex'

type UseTablePaginationPropsOptions = {
  // Compared by identity, so this must be memoized by the caller.
  filterParams: unknown
  data: unknown
  pageSize: number
  hasMore?: boolean
  fetchMore?: () => void
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number, source: PaginationChangeSource) => void
}

export function useTablePaginationProps({
  filterParams,
  data,
  pageSize,
  hasMore,
  fetchMore,
  pageIndex,
  onPageIndexChange,
}: UseTablePaginationPropsOptions): TablePaginationProps {
  const autoResetPageIndexRef = useAutoResetPageIndex(filterParams, data)

  return useMemo(() => ({
    pageIndex,
    onPageIndexChange,
    pageSize,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [pageIndex, onPageIndexChange, pageSize, hasMore, fetchMore, autoResetPageIndexRef])
}
