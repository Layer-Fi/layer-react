import { useEffect, useState } from 'react'

/**
 * Attach via ref to the element you want to monitor visibility of the element on the page
 *
 * @example
 *    const scrollPaginationRef = useRef(null)
 *    const isVisible = useIsVisible(scrollPaginationRef)
 *
 *    <div ref={scrollPaginationRef} />
 */
export const useIsVisible = (ref: React.RefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIntersecting(entry.isIntersecting)
      }
    })

    observer.observe(ref.current)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}
