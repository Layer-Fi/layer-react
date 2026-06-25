import { useCallback, useMemo, useState } from 'react'

type UsePaginatedListProps<T> = {
  data: ReadonlyArray<T>
  pageSize: number
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number) => void
}

export function usePaginatedList<T>({
  data,
  pageSize,
  pageIndex,
  onPageIndexChange,
}: UsePaginatedListProps<T>) {
  const [internalPageIndex, setInternalPageIndex] = useState(0)
  const isPaginationControlled = pageIndex !== undefined

  const pageCount = Math.max(0, Math.ceil(data.length / pageSize))
  const effectivePageIndex = Math.max(0, Math.min(pageIndex ?? internalPageIndex, pageCount - 1))

  const pageItems = useMemo(() => {
    return data.slice(
      effectivePageIndex * pageSize,
      (effectivePageIndex + 1) * pageSize,
    )
  }, [data, effectivePageIndex, pageSize])

  const setPage = useCallback((pageIndex: number) => {
    const clampedPageIndex = Math.max(0, Math.min(pageIndex, pageCount - 1))

    if (!isPaginationControlled) setInternalPageIndex(clampedPageIndex)
    onPageIndexChange?.(clampedPageIndex)
  }, [isPaginationControlled, onPageIndexChange, pageCount])

  return {
    pageCount,
    pageIndex: effectivePageIndex,
    pageItems,
    setPage,
  }
}
