import { TripsRoute, TripsRouteStoreProvider, useTripsRouteState } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { TripsTable } from '@components/TripsTable/TripsTable'
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
    ? <TripsTable />
    : <VehicleManagementDetail />
}
