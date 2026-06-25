import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type OnChangeFn, type PaginationState } from '@tanstack/react-table'

import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { clampPageIndex, getPageCount } from '@hooks/utils/pagination/utils'

type UsePaginatedTableStateParams = {
  pageIndex?: number
  pageSize: number
  onPageIndexChange?: (pageIndex: number, source: PaginationChangeSource) => void
  data?: unknown[]
}

export function usePaginatedTableState({
  pageIndex,
  pageSize,
  onPageIndexChange,
  data,
}: UsePaginatedTableStateParams) {
  const isPaginationControlled = pageIndex !== undefined
  const paginationChangeSourceRef = useRef(PaginationChangeSource.Sync)
  const [uncontrolledPagination, setUncontrolledPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })

  const requestedPageIndex = pageIndex ?? uncontrolledPagination.pageIndex
  const pageCount = getPageCount({ itemCount: data?.length ?? 0, pageSize })
  const effectivePageIndex = data === undefined
    ? requestedPageIndex
    : clampPageIndex({ pageCount, pageIndex: requestedPageIndex })

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: effectivePageIndex,
    pageSize,
  }), [effectivePageIndex, pageSize])

  useEffect(() => {
    if (requestedPageIndex === effectivePageIndex) return

    onPageIndexChange?.(effectivePageIndex, PaginationChangeSource.Sync)

    if (!isPaginationControlled) {
      setUncontrolledPagination(prev => ({ ...prev, pageIndex: effectivePageIndex }))
    }
  }, [effectivePageIndex, isPaginationControlled, onPageIndexChange, requestedPageIndex])

  const changePaginationSource = useCallback((source: PaginationChangeSource) => {
    paginationChangeSourceRef.current = source
  }, [])

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>((updaterOrValue) => {
    const nextPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

    onPageIndexChange?.(nextPagination.pageIndex, paginationChangeSourceRef.current)
    changePaginationSource(PaginationChangeSource.Sync)

    if (!isPaginationControlled) {
      setUncontrolledPagination(nextPagination)
    }
  }, [changePaginationSource, isPaginationControlled, onPageIndexChange, pagination])

  return { changePaginationSource, onPaginationChange, pagination }
}
