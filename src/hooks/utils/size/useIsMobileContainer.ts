import { useCallback, useMemo, useRef, useState } from 'react'

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
      const entry = entries[0]
      if (!entry) return

      const width = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width
      setIsMobile(width <= BREAKPOINTS.MOBILE)
    })
    observer.observe(element)
    observerRef.current = observer
  }, [])

  return useMemo(() => ({ isMobile, containerRef }), [isMobile, containerRef])
}
