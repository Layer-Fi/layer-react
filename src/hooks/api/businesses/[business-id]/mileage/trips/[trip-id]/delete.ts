import { del } from '@utils/api/authenticatedHttp'
import { useMileageSummaryGlobalCacheActions } from '@api/businesses/[business-id]/mileage/summary/get'
import { useTripsGlobalCacheActions } from '@api/businesses/[business-id]/mileage/trips/get'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_TRIP_TAG_KEY = '#delete-trip'

const deleteTrip = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, tripId: string }
>(({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`)

export const useDeleteTrip = createMutationHook({
  tags: [DELETE_TRIP_TAG_KEY],
  request: deleteTrip,
  keyParams: ['tripId'],
  argToBody: (_arg: never) => undefined,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadTrips } = useTripsGlobalCacheActions()
    const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()
    const { invalidate: invalidateMileageSummary } = useMileageSummaryGlobalCacheActions()

    return () => {
      void forceReloadTrips()
      void forceReloadVehicles()

      // Deleting a trip may change our mileage summary
      void invalidateMileageSummary()
    }
  },
})
