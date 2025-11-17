import { useState, createContext, useContext, useMemo, type PropsWithChildren } from 'react'
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
  setTableFilters: (patchFilters: Partial<TripsTableFilters>) => void
  navigate: {
    toTripsTable: () => void
    toVehicleManagement: () => void
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
    setTableFilters: () => {},
    navigate: {
      toTripsTable: () => {},
      toVehicleManagement: () => {},
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

export function TripsRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TripsRouteStoreShape>(set => ({
      routeState: { route: TripsRoute.TripsTable },
      tableFilters: {
        query: '',
        selectedVehicle: null,
        purposeFilter: TripPurposeFilterValue.All,
      },
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
    })),
  )

  return (
    <TripsRouteStoreContext.Provider value={store}>
      {props.children}
    </TripsRouteStoreContext.Provider>
  )
}
