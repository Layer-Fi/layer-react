import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { createStore, useStore } from 'zustand'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export enum TaxEstimatesRoute {
  Overview = 'Overview',
  Estimates = 'Estimates',
  Payments = 'Payments',
  Profile = 'Profile',
}

export enum OnboardingStatus {
  Loading = 'Loading',
  Error = 'Error',
  NotOnboarded = 'NotOnboarded',
  Onboarded = 'Onboarded',
  FeatureDisabled = 'FeatureDisabled',
}

type TaxEstimatesRouteState = {
  route: TaxEstimatesRoute
  backRoute: TaxEstimatesRoute
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

const TaxEstimatesRouteStoreContext = createContext(
  createStore<TaxEstimatesRouteStoreShape>(() => ({
    routeState: { route: TaxEstimatesRoute.Overview, backRoute: TaxEstimatesRoute.Overview },
    onboardingStatus: OnboardingStatus.Loading,
    navigate: () => {},
    year: getYear(new Date()),
    fullYearProjection: false,
    actions: {
      setYear: () => {},
      setFullYearProjection: () => {},
    },
  })),
)

function createRouteState(currentState: TaxEstimatesRouteState, nextRoute: TaxEstimatesRoute): TaxEstimatesRouteState {
  if (nextRoute === TaxEstimatesRoute.Profile) {
    if (currentState.route === TaxEstimatesRoute.Profile) {
      return currentState
    }

    return {
      route: TaxEstimatesRoute.Profile,
      backRoute: currentState.route,
    }
  }

  return {
    route: nextRoute,
    backRoute: nextRoute,
  }
}

export function useTaxEstimatesRouteState() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useTaxEstimatesNavigation() {
  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function useTaxEstimatesOnboardingStatus() {
  const { accountingConfiguration } = useLayerContext()

  const isFeatureEnabled = useMemo(() => {
    return accountingConfiguration && accountingConfiguration.enableTaxEstimates
  }, [accountingConfiguration])

  const store = useContext(TaxEstimatesRouteStoreContext)
  return useStore(store, (state) => {
    if (accountingConfiguration && !isFeatureEnabled) {
      return OnboardingStatus.FeatureDisabled
    }

    return state.onboardingStatus
  })
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

export function TaxEstimatesRouteStoreProvider(props: PropsWithChildren) {
  const { data: taxProfile, isLoading, isError } = useTaxProfile()
  const [store] = useState(() =>
    createStore<TaxEstimatesRouteStoreShape>(set => ({
      routeState: { route: TaxEstimatesRoute.Overview, backRoute: TaxEstimatesRoute.Overview },
      onboardingStatus: OnboardingStatus.Loading,
      navigate: (route: TaxEstimatesRoute) => {
        set(state => ({ routeState: createRouteState(state.routeState, route) }))
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
