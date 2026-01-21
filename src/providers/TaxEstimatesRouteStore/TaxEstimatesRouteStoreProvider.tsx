import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { useTaxProfile } from '@hooks/taxEstimates/useTaxProfile'

export enum TaxEstimatesRoute {
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
    routeState: { route: TaxEstimatesRoute.Estimates },
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
  const { data: taxProfile, isLoading } = useTaxProfile()
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>(set => ({
      routeState: { route: TaxEstimatesRoute.Estimates },
      isOnboarded: true,
      navigate: (route: TaxEstimatesRoute) => {
        set({ routeState: { route } })
      },
    })),
  )

  useEffect(() => {
    if (!isLoading) {
      store.setState({
        isOnboarded: taxProfile !== undefined && taxProfile.userHasSavedTaxProfile === true,
      })
    }
  }, [store, taxProfile, isLoading])

  return (
    <TaxEstimatesRouteStoreContext.Provider value={store}>
      {props.children}
    </TaxEstimatesRouteStoreContext.Provider>
  )
}
