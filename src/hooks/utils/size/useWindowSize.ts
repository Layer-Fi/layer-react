import { useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0])
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

function computeSizeClass(width: number): SizeClass {
  switch (true) {
    case width <= BREAKPOINTS.MOBILE:
      return 'mobile'
    case width <= BREAKPOINTS.TABLET:
      return 'tablet'
    default:
      return 'desktop'
  }
}

let currentSizeClass: SizeClass = typeof window === 'undefined'
  ? 'desktop'
  : computeSizeClass(window.innerWidth)

const listeners = new Set<() => void>()

function handleResize() {
  const next = computeSizeClass(window.innerWidth)
  if (next !== currentSizeClass) {
    currentSizeClass = next
    listeners.forEach(listener => listener())
  }
}

function subscribe(onStoreChange: () => void) {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
  listeners.add(onStoreChange)

  return () => {
    listeners.delete(onStoreChange)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  }
}

function getSnapshot(): SizeClass {
  return currentSizeClass
}

function getServerSnapshot(): SizeClass {
  return 'mobile'
}

export function useSizeClass(): UseSizeClass {
  const sizeClass = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(() => ({
    value: sizeClass,
    isMobile: sizeClass === 'mobile',
    isTablet: sizeClass === 'tablet',
    isDesktop: sizeClass === 'desktop',
  }), [sizeClass])
}
