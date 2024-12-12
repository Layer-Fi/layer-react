import { useLayoutEffect, useRef } from 'react'

export const useElementSize = <T extends HTMLElement>(
  callback: (
    target: T,
    entry: ResizeObserverEntry,
    size: {
      width: number
      height: number
      clientWidth: number
      clientHeight: number
    },
  ) => void,
) => {
  const ref = useRef<T>(null)
  const resizeTimeout = useRef<number | null>(null)

  useLayoutEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      resizeTimeout.current = window.setTimeout(() => {
        const entry = entries[0]
        callback(element, entry, {
          width: element.offsetWidth,
          height: element.offsetHeight,
          clientWidth: element.clientWidth,
          clientHeight: element.clientHeight,
        })
      }, 100)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
    }
  }, [callback, ref])

  return ref
}
