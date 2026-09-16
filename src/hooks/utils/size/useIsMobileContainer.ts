import { useCallback, useRef, useState } from 'react'

import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'

export function useIsMobileContainer<T extends HTMLElement>() {
  const [isMobile, setIsMobile] = useState(false)
  const observerRef = useRef<ResizeObserver | null>(null)

  const containerRef = useCallback((element: T | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null

    if (!element) return

    setIsMobile(element.getBoundingClientRect().width <= BREAKPOINTS.MOBILE)

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width != null) setIsMobile(width <= BREAKPOINTS.MOBILE)
    })
    observer.observe(element)
    observerRef.current = observer
  }, [])

  return { isMobile, containerRef }
}
