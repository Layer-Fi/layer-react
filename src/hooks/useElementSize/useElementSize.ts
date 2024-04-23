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

  useLayoutEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const observer = new ResizeObserver(entries => {
      callback(element, entries[0], {
        width: element.offsetWidth,
        height: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
      })
    })

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [callback, ref])

  return ref
}
