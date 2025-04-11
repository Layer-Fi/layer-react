import { useEffect, useRef } from 'react'

const TASKS_MOBILE_VIEWPORT_WIDTH = 1100

export const useKeepInMobileViewport = () => {
  const upperContentRef = useRef<HTMLDivElement>(null)
  const targetElementRef = useRef<HTMLDivElement>(null)
  const lastKnownSizeRef = useRef<number | null>(null)
  const lastKnownTargetPositionRef = useRef<number | null>(null)
  const upperElementInFocus = useRef<boolean | null>(false)

  useEffect(() => {
    if (!upperContentRef.current || !targetElementRef.current) return

    lastKnownSizeRef.current = upperContentRef.current.getBoundingClientRect().height
    lastKnownTargetPositionRef.current = targetElementRef.current.getBoundingClientRect().top

    // Use observer to detect upper element content changes
    const resizeObserver = new ResizeObserver(() => {
      if (!upperContentRef.current || !targetElementRef.current) return

      const currentSize = upperContentRef.current.getBoundingClientRect().height
      const currentTargetPosition = targetElementRef.current.getBoundingClientRect().top

      if (lastKnownSizeRef.current !== null && lastKnownTargetPositionRef.current !== null) {
        const sizeDelta = currentSize - lastKnownSizeRef.current

        // Only adjust if size actually changed and we're scrolled down enough
        // that the target element is in or near the viewport
        if (sizeDelta !== 0 && window.innerWidth <= TASKS_MOBILE_VIEWPORT_WIDTH) {
          const positionDelta = currentTargetPosition - lastKnownTargetPositionRef.current

          // Adjust scroll to maintain target element position but only if the upper element is not in "focus"
          if (upperElementInFocus.current === false) {
            console.log('scroll', positionDelta)
            window.scrollBy(0, positionDelta)
          }

          // After scroll adjustment, update the target position reference
          requestAnimationFrame(() => {
            if (targetElementRef.current) {
              lastKnownTargetPositionRef.current = targetElementRef.current.getBoundingClientRect().top
            }
          })
        }
      }

      lastKnownSizeRef.current = currentSize
    })

    if (upperContentRef.current) {
      resizeObserver.observe(upperContentRef.current)
    }

    // Observe scroll events to update our target position reference
    const handleScroll = () => {
      if (targetElementRef.current) {
        lastKnownTargetPositionRef.current = targetElementRef.current.getBoundingClientRect().top
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (upperContentRef.current) {
        resizeObserver.unobserve(upperContentRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return {
    upperContentRef,
    targetElementRef,
    upperElementInFocus,
  }
}
