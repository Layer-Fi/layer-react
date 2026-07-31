import { TripsRoute, TripsRouteStoreProvider, useTripsRouteState } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { ResponsiveTripsView } from '@features/mileage/trips/ResponsiveTripsView'
import { VehicleManagementDetail } from '@features/mileage/vehicles/VehicleManagementDetail'

export const Trips = () => {
  return (
    <TripsRouteStoreProvider>
      <TripsContent />
    </TripsRouteStoreProvider>
  )
}

const TripsContent = () => {
  const routeState = useTripsRouteState()

  return routeState.route === TripsRoute.TripsTable
    ? <ResponsiveTripsView />
    : <VehicleManagementDetail />
}
