import { type RefObject, useCallback, useEffect, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

type UseHorizontalOverflowOptions = {
  dependencies?: unknown[]
}

export function useHorizontalOverflow(
  elementRef: RefObject<HTMLElement | null>,
  options: UseHorizontalOverflowOptions = { dependencies: [] },
) {
  const { dependencies = [] } = options
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false)

  const updateHorizontalOverflow = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    setHasHorizontalOverflow(Math.ceil(element.scrollWidth) > Math.ceil(element.clientWidth))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, ...dependencies])

  useResizeObserver(elementRef, updateHorizontalOverflow)
  useEffect(() => {
    const element = elementRef.current?.firstElementChild as HTMLElement | null
    if (!element) return

    const observer = new ResizeObserver(() => updateHorizontalOverflow())
    observer.observe(element)

    return () => observer.disconnect()
  }, [elementRef, updateHorizontalOverflow])

  useEffect(() => {
    const id = requestAnimationFrame(() => updateHorizontalOverflow())
    return () => cancelAnimationFrame(id)
  }, [updateHorizontalOverflow])

  return hasHorizontalOverflow
}
