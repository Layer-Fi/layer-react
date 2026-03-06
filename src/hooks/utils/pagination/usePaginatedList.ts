import { useCallback, useMemo, useState } from 'react'

type UsePaginatedListProps<T> = {
  data: ReadonlyArray<T>
  pageSize: number
  initialPage?: number
  onSetPage?: (page: number) => void
}

export function usePaginatedList<T>({ data, pageSize, initialPage = 0, onSetPage }: UsePaginatedListProps<T>) {
  const [internalPageIndex, setInternalPageIndex] = useState(initialPage)

  const pageCount = Math.max(0, Math.ceil(data.length / pageSize))
  const effectivePageIndex = Math.max(0, Math.min(internalPageIndex, pageCount - 1))

  const pageItems = useMemo(() => {
    return data.slice(
      effectivePageIndex * pageSize,
      (effectivePageIndex + 1) * pageSize,
    ) as ReadonlyArray<T>
  }, [data, effectivePageIndex, pageSize])

  const setPage = useCallback((pageIndex: number) => {
    const clampedPageIndex = Math.max(0, Math.min(pageIndex, pageCount - 1))

    setInternalPageIndex(clampedPageIndex)
    onSetPage?.(clampedPageIndex)
  }, [onSetPage, pageCount])

  return {
    pageCount,
    pageIndex: effectivePageIndex,
    pageItems,
    setPage,
  }
}
