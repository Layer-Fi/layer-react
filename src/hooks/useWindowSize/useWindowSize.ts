import { useLayoutEffect, useMemo, useState } from 'react'

import { BREAKPOINTS } from '@config/general'

export const useWindowSize = (): [number, number] => {
  const [size, setSize] = useState<[number, number]>([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }

    window.addEventListener('resize', updateSize)

    updateSize()

    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

export type SizeClass = 'mobile' | 'tablet' | 'desktop'

interface UseSizeClass {
  value: SizeClass
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useSizeClass(): UseSizeClass {
  const [width] = useWindowSize()

  const sizeClass = useMemo((): SizeClass => {
    switch (true) {
      case width <= BREAKPOINTS.MOBILE:
        return 'mobile'
      case width <= BREAKPOINTS.TABLET:
        return 'tablet'
      default:
        return 'desktop'
    }
  }, [width])

  return {
    value: sizeClass,
    isMobile: sizeClass === 'mobile',
    isTablet: sizeClass === 'tablet',
    isDesktop: sizeClass === 'desktop',
  }
}
