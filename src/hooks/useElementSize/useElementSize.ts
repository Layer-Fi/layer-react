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
  const isFirstCallback = useRef(true)

  useLayoutEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const invokeCallback = (entry: ResizeObserverEntry) => {
      callback(element, entry, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
      })
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (isFirstCallback.current) {
        isFirstCallback.current = false
        invokeCallback(entry)
        return
      }

      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      resizeTimeout.current = window.setTimeout(() => {
        invokeCallback(entry)
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
