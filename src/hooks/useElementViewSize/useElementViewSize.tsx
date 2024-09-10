import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { View } from '../../types/general'

export const useElementViewSize = <T extends HTMLElement>(
  callback: (view: View) => void,
) => {
  const ref = useRef<T>(null)
  const [view, setView] = useState<View>('desktop')

  useLayoutEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const observer = new ResizeObserver(_entries => {
      const width = element.offsetWidth
      if (width) {
        if (width >= BREAKPOINTS.TABLET && view !== 'desktop') {
          setView('desktop')
        } else if (
          width <= BREAKPOINTS.TABLET &&
          width > BREAKPOINTS.MOBILE &&
          view !== 'tablet'
        ) {
          setView('tablet')
        } else if (width < BREAKPOINTS.MOBILE && view !== 'mobile') {
          setView('mobile')
        }
      }
    })

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [callback, ref])

  useEffect(() => {
    callback(view)
  }, [view])

  return ref
}
