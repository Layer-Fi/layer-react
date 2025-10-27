import { useEffect, useState, RefObject, useCallback } from 'react'

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
    if (!elementRef.current) {
      return
    }

    const element = checkFirstChild
      ? (elementRef.current.children[0] as HTMLElement)
      : elementRef.current

    if (!element) {
      return
    }

    // Check for horizontal overflow (handles text-overflow: ellipsis)
    // Use Math.ceil to account for sub-pixel rounding differences
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

  useEffect(() => {
    // Use requestAnimationFrame to ensure the check happens after styles are applied
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        checkTruncation()
      })
    }, 0)

    window.addEventListener('resize', checkTruncation)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkTruncation)
    }
  }, [elementRef, checkFirstChild, checkTruncation])

  return isTruncated
}
