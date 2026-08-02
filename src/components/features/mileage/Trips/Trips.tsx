import { TripsRoute, TripsRouteStoreProvider, useTripsRouteState } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { TripsView } from '@features/mileage/TripsView/TripsView'
import { VehiclesView } from '@features/mileage/VehiclesView/VehiclesView'

export const Trips = () => {
  return (
    <TripsRouteStoreProvider>
      <TripsContent />
    </TripsRouteStoreProvider>
  )
}

const TripsContent = () => {
  const routeState = useTripsRouteState()

  return routeState.route === TripsRoute.Trips
    ? <TripsView />
    : <VehiclesView />
}
