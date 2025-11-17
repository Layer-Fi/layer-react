import { useState, createContext, useContext, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'

export enum TripsRoute {
  TripsTable = 'TripsTable',
  VehicleManagement = 'VehicleManagement',
}

type TripsTableRouteState = { route: TripsRoute.TripsTable }
type VehicleManagementRouteState = { route: TripsRoute.VehicleManagement }
type TripsRouteState = TripsTableRouteState | VehicleManagementRouteState

type TripsRouteStoreShape = {
  routeState: TripsRouteState
  navigate: {
    toTripsTable: () => void
    toVehicleManagement: () => void
  }
}

const TripsRouteStoreContext = createContext(
  createStore<TripsRouteStoreShape>(() => ({
    routeState: { route: TripsRoute.TripsTable },
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

export function useTripsNavigation() {
  const store = useContext(TripsRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function TripsRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TripsRouteStoreShape>(set => ({
      routeState: { route: TripsRoute.TripsTable },
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
