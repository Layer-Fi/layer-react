import { TripsRoute, TripsRouteStoreProvider, useTripsRouteState } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { ResponsiveTripsView } from '@components/TripsTable/ResponsiveTripsView'
import { VehicleManagementDetail } from '@components/VehicleManagement/VehicleManagementDetail'

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
