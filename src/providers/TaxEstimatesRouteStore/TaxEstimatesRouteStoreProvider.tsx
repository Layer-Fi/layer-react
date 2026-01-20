import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

export enum TaxEstimatesRoute {
  Overview = 'Overview',
  Estimates = 'Estimates',
  Payments = 'Payments',
  Profile = 'Profile',
}

type TaxEstimatesRouteState = {
  route: TaxEstimatesRoute
}

type TaxEstimatesRouteStoreShape = {
  routeState: TaxEstimatesRouteState
  isOnboarded: boolean
  navigate: (route: TaxEstimatesRoute) => void
}

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(() => ({
    routeState: { route: TaxEstimatesRoute.Overview },
    isOnboarded: true,
    navigate: () => {},
  })),
)

export function useTaxEstimatesRouteState() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useTaxEstimatesNavigation() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function useTaxEstimatesOnboardingState() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  const isOnboarded = useStore(store, state => state.isOnboarded)
  return useMemo(() => ({ isOnboarded }), [isOnboarded])
}

export function TaxEstimatesRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>(set => ({
      routeState: { route: TaxEstimatesRoute.Overview },
      isOnboarded: true,
      navigate: (route: TaxEstimatesRoute) => {
        set({ routeState: { route } })
      },
    })),
  )

  return (
    <TaxEstimatesRouteStoreContext.Provider value={store}>
      {props.children}
    </TaxEstimatesRouteStoreContext.Provider>
  )
}
