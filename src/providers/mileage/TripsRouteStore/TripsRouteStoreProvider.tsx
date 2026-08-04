import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { TripPurposeFilterValue } from '@schemas/mileage/trip'
import type { Vehicle } from '@schemas/mileage/vehicle'

export type TripsTableFilters = {
  query: string
  selectedVehicle: Vehicle | null
  purposeFilter: TripPurposeFilterValue
}

export enum TripsRoute {
  Trips = 'Trips',
  Vehicles = 'Vehicles',
}

type TripsRouteState =
  | { route: TripsRoute.Trips }
  | { route: TripsRoute.Vehicles }

type TripsRouteStoreShape = {
  routeState: TripsRouteState
  tableFilters: TripsTableFilters
  currentTripsPage: number
  setTableFilters: (patchFilters: Partial<TripsTableFilters>) => void
  navigate: {
    toTrips: () => void
    toVehicles: () => void
  }
  actions: {
    setCurrentTripsPage: (page: number) => void
  }
}

const TripsRouteStoreContext = createContext(
  createStore<TripsRouteStoreShape>(() => ({
    routeState: { route: TripsRoute.Trips },
    tableFilters: {
      query: '',
      selectedVehicle: null,
      purposeFilter: TripPurposeFilterValue.All,
    },
    currentTripsPage: 0,
    setTableFilters: () => {},
    navigate: {
      toTrips: () => {},
      toVehicles: () => {},
    },
    actions: {
      setCurrentTripsPage: () => {},
    },
  })),
)

export function useTripsRouteState() {
  const store = useContext(TripsRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useTripsTableFilters() {
  const store = useContext(TripsRouteStoreContext)
  const tableFilters = useStore(store, state => state.tableFilters)
  const setTableFilters = useStore(store, state => state.setTableFilters)

  return useMemo(() => ({ tableFilters, setTableFilters }), [tableFilters, setTableFilters])
}

export function useTripsNavigation() {
  const store = useContext(TripsRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function useCurrentTripsPage() {
  const store = useContext(TripsRouteStoreContext)
  const currentTripsPage = useStore(store, state => state.currentTripsPage)
  const setCurrentTripsPage = useStore(store, state => state.actions.setCurrentTripsPage)
  return useMemo(() => ({ currentTripsPage, setCurrentTripsPage }),
    [currentTripsPage, setCurrentTripsPage],
  )
}

export function TripsRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TripsRouteStoreShape>(set => ({
      routeState: { route: TripsRoute.Trips },
      tableFilters: {
        query: '',
        selectedVehicle: null,
        purposeFilter: TripPurposeFilterValue.All,
      },
      currentTripsPage: 0,
      setTableFilters: (patchFilters: Partial<TripsTableFilters>) => {
        set(state => ({
          tableFilters: {
            ...state.tableFilters,
            ...patchFilters,
          },
        }))
      },
      navigate: {
        toVehicles: () => {
          set(() => ({
            routeState: {
              route: TripsRoute.Vehicles,
            },
          }))
        },
        toTrips: () => {
          set(() => ({
            routeState: {
              route: TripsRoute.Trips,
            },
          }))
        },
      },
      actions: {
        setCurrentTripsPage: (page: number) => {
          set({ currentTripsPage: page })
        },
      },
    })),
  )

  return (
    <TripsRouteStoreContext.Provider value={store}>
      {props.children}
    </TripsRouteStoreContext.Provider>
  )
}
