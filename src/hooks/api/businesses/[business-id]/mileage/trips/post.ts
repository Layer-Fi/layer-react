import { TripSchema, type UpsertTripEncoded } from '@schemas/trip'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useMileageSummaryGlobalCacheActions } from '@api/businesses/[business-id]/mileage/summary/get'
import { useTripsGlobalCacheActions } from '@api/businesses/[business-id]/mileage/trips/get'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UPSERT_TRIP_TAG_KEY = '#upsert-trip'

export type UpsertTripBody = UpsertTripEncoded

export const UpsertTripReturnSchema = UnwrappedDataResponseSchema(TripSchema)

export type UpsertTripReturnEncoded = typeof UpsertTripReturnSchema.Encoded

export type CreateParams = { readonly businessId: string }

const createTrip = post<UpsertTripReturnEncoded, UpsertTripBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/trips`,
)

export const usePostTrip = createMutationHook({
  tags: [UPSERT_TRIP_TAG_KEY],
  request: createTrip,
  schema: UpsertTripReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadTrips } = useTripsGlobalCacheActions()
    const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()
    const { invalidate: invalidateMileageSummary } = useMileageSummaryGlobalCacheActions()

    return () => {
      void forceReloadTrips()

      // Creating a trip may change our ability to delete/archive the vehicle
      void forceReloadVehicles()

      // Creating a trip may change our mileage summary
      void invalidateMileageSummary()
    }
  },
})
