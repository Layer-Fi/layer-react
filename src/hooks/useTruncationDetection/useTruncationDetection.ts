import { useEffect, useState, RefObject, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import useResizeObserver from '@react-hook/resize-observer'

export interface UseTruncationDetectionOptions {
  dependencies?: unknown[]
  /**
   * Whether to check the first child element instead of the element itself.
   * Useful when the element has wrapper elements.
   */
  checkFirstChild?: boolean
}

export function useTruncationDetection(
  elementRef: RefObject<HTMLElement>,
  options: UseTruncationDetectionOptions = {
    dependencies: [],
    checkFirstChild: false,
  },
): boolean {
  const { checkFirstChild = false, dependencies = [] } = options
  const [isTruncated, setIsTruncated] = useState(false)

  const checkTruncation = useCallback(() => {
    if (!elementRef || !elementRef.current) {
      return
    }

    const element = checkFirstChild
      ? (elementRef.current.children[0] as HTMLElement)
      : elementRef.current

    if (!element) {
      return
    }

    const scrollWidth = element.scrollWidth
    const clientWidth = element.clientWidth
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    const isHorizontallyOverflowing = Math.ceil(scrollWidth) > Math.ceil(clientWidth)
    const isVerticallyOverflowing = Math.ceil(scrollHeight) > Math.ceil(clientHeight)

    const isOverflowing = isHorizontallyOverflowing || isVerticallyOverflowing

    setIsTruncated(isOverflowing)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- We need to re-check the truncation when the children change
  }, [elementRef, checkFirstChild, ...dependencies])

  const DEBOUNCE_TIME_IN_MS = 450
  const debouncedCheckTruncation = useMemo(
    () => debounce(checkTruncation, DEBOUNCE_TIME_IN_MS),
    [checkTruncation],
  )

  useResizeObserver(elementRef, debouncedCheckTruncation)

  useEffect(() => {
    const id = requestAnimationFrame(() => checkTruncation())
    return () => cancelAnimationFrame(id)
  }, [checkTruncation])

  return isTruncated
}
