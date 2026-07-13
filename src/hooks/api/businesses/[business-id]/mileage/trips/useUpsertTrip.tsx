import { TripSchema, type UpsertTripEncoded } from '@schemas/trip'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useMileageSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_TRIP_TAG_KEY = '#upsert-trip'

export enum UpsertTripMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertTripBody = UpsertTripEncoded

const UpsertTripReturnSchema = UnwrappedDataResponseSchema(TripSchema)

type UpsertTripReturnEncoded = typeof UpsertTripReturnSchema.Encoded

const createTrip = post<UpsertTripReturnEncoded, UpsertTripBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/trips`,
)

const updateTrip = patch<
  UpsertTripReturnEncoded,
  UpsertTripBody,
  { businessId: string, tripId: string }
>(
  ({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`,
)

export type CreateParams = { readonly businessId: string }
export type UpdateParams = { readonly businessId: string, readonly tripId: string }

export type UpsertParams = CreateParams | UpdateParams

const useCreateTrip = createMutationHook({
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

const useUpdateTrip = createMutationHook({
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

type UseUpsertTripProps =
  | { mode: UpsertTripMode.Create }
  | { mode: UpsertTripMode.Update, tripId: string }

export const useUpsertTrip = (props: UseUpsertTripProps) => {
  const { mode } = props
  const tripId = mode === UpsertTripMode.Update ? props.tripId : undefined

  const createResponse = useCreateTrip()
  const updateResponse = useUpdateTrip({
    tripId: tripId ?? '',
  })

  return mode === UpsertTripMode.Create ? createResponse : updateResponse
}
