import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { createStore, useStore } from 'zustand'

import { getInitialLayerPathRoute, type RouteNavigation, type RouteState, upsertLayerPathQueryParam } from '@utils/routing'

export enum TaxEstimatesRoute {
  Overview = 'overview',
  Estimates = 'estimates',
  Payments = 'payments',
  Profile = 'profile',
}

const VIEW_NAME = 'te'
const DEFAULT_ROUTE = TaxEstimatesRoute.Overview
const TAX_ESTIMATES_ROUTES = new Set<TaxEstimatesRoute>(Object.values(TaxEstimatesRoute))

function isTaxEstimatesRoute(route: string): route is TaxEstimatesRoute {
  return TAX_ESTIMATES_ROUTES.has(route as TaxEstimatesRoute)
}

type TaxEstimatesRouteStoreShape = {
  routeState: RouteState<TaxEstimatesRoute>
  navigate: RouteNavigation
  year: number
  fullYearProjection: boolean
  actions: {
    setYear: (year: number) => void
    setFullYearProjection: (value: boolean) => void
  }
  external: {
    hooks: {
      onClickReviewTransactions: (payload: { uncategorizedAmount: number, uncategorizedTransactionCount: number }) => void
    }
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
    external: {
      hooks: {
        onClickReviewTransactions: (_payload: { uncategorizedAmount: number, uncategorizedTransactionCount: number }) => {},
      },
    },
  })),
)

export type TaxEstimatesRouteStoreProviderExternalHooks = {
  onClickReviewTransactions: (payload: { uncategorizedAmount: number, uncategorizedTransactionCount: number }) => void
}

export type TaxEstimatesRouteStoreProviderProps = PropsWithChildren<{
  external: TaxEstimatesRouteStoreProviderExternalHooks
}>

export function TaxEstimatesRouteStoreProvider(props: TaxEstimatesRouteStoreProviderProps) {
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>((set) => {
      const initialRoute = getInitialLayerPathRoute<TaxEstimatesRoute>(VIEW_NAME, DEFAULT_ROUTE, isTaxEstimatesRoute)
      const navigateToRoute = (route: TaxEstimatesRoute) => {
        set(() => ({ routeState: { route } }))
        upsertLayerPathQueryParam(VIEW_NAME, route)
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
        external: {
          hooks: {
            onClickReviewTransactions: props.external.onClickReviewTransactions,
          },
        },
      }
    }),
  )

  useEffect(() => {
    upsertLayerPathQueryParam(VIEW_NAME, store.getState().routeState.route)
  }, [store])

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

export function useTaxEstimatesRouteStoreProviderExternalHooks() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.external.hooks)
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
