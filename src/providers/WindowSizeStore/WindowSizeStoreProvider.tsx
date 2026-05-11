import { createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'

export type SizeClass = 'mobile' | 'tablet' | 'desktop'

type WindowSizeState = {
  width: number
  height: number
}

function getInitialState(): WindowSizeState {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

const windowSizeStore = createStore<WindowSizeState>(() => getInitialState())

if (typeof window !== 'undefined') {
  const update = () => {
    windowSizeStore.setState({ width: window.innerWidth, height: window.innerHeight })
  }
  window.addEventListener('resize', update)
}

const WindowSizeStoreContext = createContext(windowSizeStore)

export function WindowSizeStoreProvider({ children }: PropsWithChildren) {
  return (
    <WindowSizeStoreContext.Provider value={windowSizeStore}>
      {children}
    </WindowSizeStoreContext.Provider>
  )
}

function widthToSizeClass(width: number): SizeClass {
  switch (true) {
    case width <= BREAKPOINTS.MOBILE:
      return 'mobile'
    case width <= BREAKPOINTS.TABLET:
      return 'tablet'
    default:
      return 'desktop'
  }
}

export type UseSizeClass = {
  value: SizeClass
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useWindowSize(): [number, number] {
  const store = useContext(WindowSizeStoreContext)
  const width = useStore(store, s => s.width)
  const height = useStore(store, s => s.height)
  return [width, height]
}

export function useSizeClass(): UseSizeClass {
  const store = useContext(WindowSizeStoreContext)
  const value = useStore(store, s => widthToSizeClass(s.width))

  return {
    value,
    isMobile: value === 'mobile',
    isTablet: value === 'tablet',
    isDesktop: value === 'desktop',
  }
}
