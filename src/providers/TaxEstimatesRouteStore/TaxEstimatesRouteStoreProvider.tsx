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
  actions: {
    setYear: (year: number) => void
  }
}

const currentYear = new Date().getFullYear()

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(() => ({
    routeState: { route: TaxEstimatesRoute.Estimates },
    onboardingStatus: OnboardingStatus.Loading,
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
      actions: {
        setYear: (year: number) => {
          set({ year })
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
