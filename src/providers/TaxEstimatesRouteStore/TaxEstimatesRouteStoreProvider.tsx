import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { useTaxProfile } from '@hooks/taxEstimates/useTaxProfile'

export enum TaxEstimatesRoute {
  Estimates = 'Estimates',
  Payments = 'Payments',
  Profile = 'Profile',
}

export enum OnboardingStatus {
  Loading = 'Loading',
  Error = 'Error',
  NotOnboarded = 'NotOnboarded',
  Onboarded = 'Onboarded',
}

type TaxEstimatesRouteState = {
  route: TaxEstimatesRoute
}

type TaxEstimatesRouteStoreShape = {
  routeState: TaxEstimatesRouteState
  onboardingStatus: OnboardingStatus
  navigate: (route: TaxEstimatesRoute) => void
  year: number
  fullYearProjection: boolean
  actions: {
    setYear: (year: number) => void
    setFullYearProjection: (value: boolean) => void
  }
}

const currentYear = new Date().getFullYear()

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(() => ({
    routeState: { route: TaxEstimatesRoute.Estimates },
    onboardingStatus: OnboardingStatus.Loading,
    navigate: () => {},
    year: currentYear,
    fullYearProjection: false,
    actions: {
      setYear: () => {},
      setFullYearProjection: () => {},
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

export function useTaxEstimatesOnboardingStatus() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.onboardingStatus)
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

  const isCurrentYear = year === currentYear
  const fullYearProjection = isCurrentYear ? rawFullYearProjection : false
  const setFullYearProjection = useStore(store, state => state.actions.setFullYearProjection)

  return useMemo(() => ({ fullYearProjection, setFullYearProjection }), [fullYearProjection, setFullYearProjection])
}

export function TaxEstimatesRouteStoreProvider(props: PropsWithChildren) {
  const { data: taxProfile, isLoading, isError } = useTaxProfile()
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>(set => ({
      routeState: { route: TaxEstimatesRoute.Estimates },
      onboardingStatus: OnboardingStatus.Loading,
      navigate: (route: TaxEstimatesRoute) => {
        set({ routeState: { route } })
      },
      year: currentYear,
      fullYearProjection: false,
      actions: {
        setYear: (year: number) => {
          set({ year })
        },
        setFullYearProjection: (fullYearProjection: boolean) => {
          set({ fullYearProjection })
        },
      },
    })),
  )

  useEffect(() => {
    if (isLoading) {
      store.setState({ onboardingStatus: OnboardingStatus.Loading })
      return
    }

    if (isError) {
      store.setState({ onboardingStatus: OnboardingStatus.Error })
      return
    }

    if (taxProfile && !taxProfile.userHasSavedTaxProfile) {
      store.setState({ onboardingStatus: OnboardingStatus.NotOnboarded })
      return
    }

    if (taxProfile && taxProfile.userHasSavedTaxProfile) {
      store.setState({ onboardingStatus: OnboardingStatus.Onboarded })
      return
    }
  }, [store, taxProfile, isLoading, isError])

  return (
    <TaxEstimatesRouteStoreContext.Provider value={store}>
      {props.children}
    </TaxEstimatesRouteStoreContext.Provider>
  )
}
