import { createContext, type PropsWithChildren, useContext, useLayoutEffect, useState } from 'react'
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

function buildStore() {
  return createStore<WindowSizeState>(() => getInitialState())
}

const defaultStore = buildStore()

const WindowSizeStoreContext = createContext(defaultStore)

export function WindowSizeStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(buildStore)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const update = () => {
      store.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', update)
    update()

    return () => window.removeEventListener('resize', update)
  }, [store])

  return (
    <WindowSizeStoreContext.Provider value={store}>
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
