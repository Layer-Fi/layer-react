import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { createStore, useStore } from 'zustand'

import { type RouteNavigation, type RouteState } from '@utils/routing'

export enum TaxEstimatesRoute {
  Overview = 'overview',
  Estimates = 'estimates',
  Payments = 'payments',
  Profile = 'profile',
}

const DEFAULT_ROUTE = TaxEstimatesRoute.Overview

type TaxEstimatesRouteStoreShape = {
  routeState: RouteState<TaxEstimatesRoute>
  navigate: RouteNavigation
  year: number
  fullYearProjection: boolean
  actions: {
    setYear: (year: number) => void
    setFullYearProjection: (value: boolean) => void
  }
}

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(set => ({
    routeState: { route: DEFAULT_ROUTE },
    navigate: {
      toOverview: () => set(() => ({ routeState: { route: DEFAULT_ROUTE } })),
      toEstimates: () => set(() => ({ routeState: { route: TaxEstimatesRoute.Estimates } })),
      toPayments: () => set(() => ({ routeState: { route: TaxEstimatesRoute.Payments } })),
      toProfile: () => set(() => ({ routeState: { route: TaxEstimatesRoute.Profile } })),
    },
    year: getYear(new Date()),
    fullYearProjection: false,
    actions: {
      setYear: () => {},
      setFullYearProjection: () => {},
    },
  })),
)

export function TaxEstimatesRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>((set) => {
      const initialRoute = DEFAULT_ROUTE
      const navigateToRoute = (route: TaxEstimatesRoute) => {
        set(() => ({ routeState: { route } }))
      }

      return {
        routeState: { route: initialRoute },
        navigate: {
          toOverview: () => navigateToRoute(DEFAULT_ROUTE),
          toEstimates: () => navigateToRoute(TaxEstimatesRoute.Estimates),
          toPayments: () => navigateToRoute(TaxEstimatesRoute.Payments),
          toProfile: () => navigateToRoute(TaxEstimatesRoute.Profile),
        },
        year: getYear(new Date()),
        fullYearProjection: false,
        actions: {
          setYear: (year: number) => {
            set({ year })
          },
          setFullYearProjection: (fullYearProjection: boolean) => {
            set({ fullYearProjection })
          },
        },
      }
    }),
  )

  return (
    <TaxEstimatesRouteStoreContext.Provider value={store}>
      {props.children}
    </TaxEstimatesRouteStoreContext.Provider>
  )
}

export function useTaxEstimatesRouteState() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useTaxEstimatesNavigation() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function useTaxEstimatesYear() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  const year = useStore(store, state => state.year)
  const setYear = useStore(store, state => state.actions.setYear)
  return useMemo(() => ({ year, setYear }), [year, setYear])
}

export function useFullYearProjection() {
  const store = useContext(TaxEstimatesRouteStoreContext)

  const rawFullYearProjection = useStore(store, state => state.fullYearProjection)
  const year = useStore(store, state => state.year)

  const isCurrentYear = year === getYear(new Date())
  const fullYearProjection = isCurrentYear ? rawFullYearProjection : false
  const setFullYearProjection = useStore(store, state => state.actions.setFullYearProjection)

  return useMemo(() => ({ fullYearProjection, setFullYearProjection }), [fullYearProjection, setFullYearProjection])
}
