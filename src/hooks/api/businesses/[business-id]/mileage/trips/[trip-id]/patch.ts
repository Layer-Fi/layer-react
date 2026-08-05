import { patch } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useMileageSummaryGlobalCacheActions } from '@api/businesses/[business-id]/mileage/summary/get'
import { useTripsGlobalCacheActions } from '@api/businesses/[business-id]/mileage/trips/get'
import {
  UPSERT_TRIP_TAG_KEY,
  type UpsertTripBody,
  type UpsertTripReturnEncoded,
  UpsertTripReturnSchema,
} from '@api/businesses/[business-id]/mileage/trips/post'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'

export type UpdateParams = { readonly businessId: string, readonly tripId: string }

const updateTrip = patch<
  UpsertTripReturnEncoded,
  UpsertTripBody,
  { businessId: string, tripId: string }
>(
  ({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`,
)

export const usePatchTrip = createMutationHook({
  tags: [UPSERT_TRIP_TAG_KEY],
  request: updateTrip,
  keyParams: ['tripId'],
  schema: UpsertTripReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchTripByKey } = useTripsGlobalCacheActions()
    const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()
    const { invalidate: invalidateMileageSummary } = useMileageSummaryGlobalCacheActions()

    return (data) => {
      void patchTripByKey(data)

      // Updating a trip may change our ability to delete/archive the vehicle
      void forceReloadVehicles()

      // Updating a trip may change our mileage summary
      void invalidateMileageSummary()
    }
  },
})
