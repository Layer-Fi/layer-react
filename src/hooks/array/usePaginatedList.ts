import { useCallback, useMemo, useState } from 'react'

export function usePaginatedList<T>(list: ReadonlyArray<T>, pageSize: number) {
  const [internalPageIndex, setInternalPageIndex] = useState(0)

  const pageCount = Math.max(0, Math.ceil(list.length / pageSize))
  const effectivePageIndex = Math.max(0, Math.min(internalPageIndex, pageCount - 1))

  const pageItems = useMemo(() => {
    return list.slice(
      effectivePageIndex * pageSize,
      (effectivePageIndex + 1) * pageSize,
    ) as ReadonlyArray<T>
  }, [list, effectivePageIndex, pageSize])

  const next = useCallback(() => {
    setInternalPageIndex(Math.min(effectivePageIndex + 1, pageCount - 1))
  }, [effectivePageIndex, pageCount])

  const set = useCallback((pageIndex: number) => {
    setInternalPageIndex(Math.max(0, Math.min(pageIndex, pageCount - 1)))
  }, [pageCount])

  const previous = useCallback(() => {
    setInternalPageIndex(Math.max(effectivePageIndex - 1, 0))
  }, [effectivePageIndex])

  const reset = useCallback(() => {
    setInternalPageIndex(0)
  }, [])

  return {
    pageCount,
    pageIndex: effectivePageIndex,
    pageItems,
    pageSize,
    next,
    set,
    previous,
    reset,
  }
}
