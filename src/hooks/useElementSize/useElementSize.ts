import { useLayoutEffect, useRef } from 'react'

export interface ElementSize {
  width: number
  height: number
}

export const useElementSize = <T extends HTMLElement>(
  callback: (size: ElementSize) => void,
) => {
  const ref = useRef<T>(null)
  const callbackRef = useRef(callback)
  const isFirstRender = useRef(true)
  const resizeTimeout = useRef<number | null>(null)

  callbackRef.current = callback

  useLayoutEffect(() => {
    const element = ref?.current

    if (!element) return

    const invokeCallback = ({ width, height }: ElementSize) => {
      callbackRef.current({ width, height })
    }

    if (isFirstRender.current) {
      const rect = element.getBoundingClientRect()
      invokeCallback({
        width: rect.width,
        height: rect.height,
      })
      isFirstRender.current = false
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const boxSize = entry?.borderBoxSize[0]
      if (!boxSize) return

      const width = boxSize.inlineSize
      const height = boxSize.blockSize

      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      resizeTimeout.current = window.setTimeout(() => {
        invokeCallback({ width, height })
      }, 100)
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
    }
  }, [])
  return ref
}
