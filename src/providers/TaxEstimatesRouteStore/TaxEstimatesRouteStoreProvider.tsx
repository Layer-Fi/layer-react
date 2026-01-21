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
  year: number
  actions: {
    setYear: (year: number) => void
  }
}

const currentYear = new Date().getFullYear()

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(() => ({
    routeState: { route: TaxEstimatesRoute.Estimates },
    isOnboarded: true,
    navigate: () => {},
    year: currentYear,
    actions: {
      setYear: () => {},
    },
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

export function useTaxEstimatesYear() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  const year = useStore(store, state => state.year)
  const setYear = useStore(store, state => state.actions.setYear)
  return useMemo(() => ({ year, setYear }), [year, setYear])
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
      year: currentYear,
      actions: {
        setYear: (year: number) => {
          set({ year })
        },
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
