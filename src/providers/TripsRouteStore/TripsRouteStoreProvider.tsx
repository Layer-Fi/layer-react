import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { Vehicle } from '@schemas/vehicle'
import { TripPurposeFilterValue } from '@features/trips/components/TripPurposeToggle'

export type TripsTableFilters = {
  query: string
  selectedVehicle: Vehicle | null
  purposeFilter: TripPurposeFilterValue
}

export enum TripsRoute {
  TripsTable = 'TripsTable',
  VehicleManagement = 'VehicleManagement',
}

type TripsTableRouteState = { route: TripsRoute.TripsTable }
type VehicleManagementRouteState = { route: TripsRoute.VehicleManagement }
type TripsRouteState = TripsTableRouteState | VehicleManagementRouteState

type TripsRouteStoreShape = {
  routeState: TripsRouteState
  tableFilters: TripsTableFilters
  currentTripsPage: number
  setTableFilters: (patchFilters: Partial<TripsTableFilters>) => void
  navigate: {
    toTripsTable: () => void
    toVehicleManagement: () => void
  }
  actions: {
    setCurrentTripsPage: (page: number) => void
  }
}

const TripsRouteStoreContext = createContext(
  createStore<TripsRouteStoreShape>(() => ({
    routeState: { route: TripsRoute.TripsTable },
    tableFilters: {
      query: '',
      selectedVehicle: null,
      purposeFilter: TripPurposeFilterValue.All,
    },
    currentTripsPage: 0,
    setTableFilters: () => {},
    navigate: {
      toTripsTable: () => {},
      toVehicleManagement: () => {},
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
      routeState: { route: TripsRoute.TripsTable },
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
        toVehicleManagement: () => {
          set(() => ({
            routeState: {
              route: TripsRoute.VehicleManagement,
            },
          }))
        },
        toTripsTable: () => {
          set(() => ({
            routeState: {
              route: TripsRoute.TripsTable,
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
