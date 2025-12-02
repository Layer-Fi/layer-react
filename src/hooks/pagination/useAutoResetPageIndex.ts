import { type MutableRefObject, useEffect, useRef } from 'react'

/**
 * Returns a ref that indicates whether pagination should reset to page 0.
 * Set to `true` when filters change, `false` when data changes.
 *
 * @param filters - Filter parameters object
 * @param data - Data array
 * @returns Ref with boolean flag for auto-reset behavior
 */
export function useAutoResetPageIndex(filters: unknown, data: unknown): MutableRefObject<boolean> {
  const autoResetPageIndexRef = useRef(false)
  const prevFiltersRef = useRef(filters)

  // Set to true when filters change
  if (prevFiltersRef.current !== filters) {
    autoResetPageIndexRef.current = true
    prevFiltersRef.current = filters
  }

  // Set to false when data changes
  useEffect(() => {
    autoResetPageIndexRef.current = false
  }, [data])

  return autoResetPageIndexRef
}
