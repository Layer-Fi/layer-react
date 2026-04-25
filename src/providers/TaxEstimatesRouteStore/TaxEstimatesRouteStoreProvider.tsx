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
const TAX_ESTIMATES_ROUTES = new Set<TaxEstimatesRoute>(Object.values(TaxEstimatesRoute))

type TaxEstimatesRouteStoreShape = {
  /* Route navigation */
  routeState: RouteState<TaxEstimatesRoute>
  navigate: RouteNavigation

  /* States */
  year: number
  fullYearProjection: boolean

  /* Actions */
  actions: {
    setYear: (year: number) => void
    setFullYearProjection: (value: boolean) => void
  }

  /* External hooks */
  external: {
    hooks: {
      onClickReviewTransactions: (payload: { uncategorizedAmount: number, uncategorizedTransactionCount: number }) => void
    }
  }
}

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(set => ({
    routeState: { route: TaxEstimatesRoute.Overview },
    navigate: {
      toOverview: () => set(() => ({ routeState: { route: TaxEstimatesRoute.Overview } })),
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

const initialRoute = getInitialLayerPathRoute<TaxEstimatesRoute>((viewName, segment) => {
  if (viewName !== VIEW_NAME) return TaxEstimatesRoute.Overview
  if (!segment) return TaxEstimatesRoute.Overview
  if (!TAX_ESTIMATES_ROUTES.has(segment as TaxEstimatesRoute)) return TaxEstimatesRoute.Overview

  return segment as TaxEstimatesRoute
})

export type TaxEstimatesRouteStoreProviderProps = PropsWithChildren<{
  external: TaxEstimatesRouteStoreProviderExternalHooks
}>

export function TaxEstimatesRouteStoreProvider(props: TaxEstimatesRouteStoreProviderProps) {
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>(set => ({
      routeState: { route: initialRoute },
      navigate: {
        toOverview: () => {
          set(() => ({ routeState: { route: TaxEstimatesRoute.Overview } }))
          upsertLayerPathQueryParam(VIEW_NAME, TaxEstimatesRoute.Overview)
        },
        toEstimates: () => {
          set(() => ({ routeState: { route: TaxEstimatesRoute.Estimates } }))
          upsertLayerPathQueryParam(VIEW_NAME, TaxEstimatesRoute.Estimates)
        },
        toPayments: () => {
          set(() => ({ routeState: { route: TaxEstimatesRoute.Payments } }))
          upsertLayerPathQueryParam(VIEW_NAME, TaxEstimatesRoute.Payments)
        },
        toProfile: () => {
          set(() => ({ routeState: { route: TaxEstimatesRoute.Profile } }))
          upsertLayerPathQueryParam(VIEW_NAME, TaxEstimatesRoute.Profile)
        },
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
    })),
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
