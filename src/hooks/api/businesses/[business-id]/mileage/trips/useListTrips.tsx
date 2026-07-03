import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Trip, TripSchema } from '@schemas/trip'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_TRIPS_TAG_KEY = '#list-trips'

export type ListTripsFilterParams = {
  query?: string
  vehicleId?: string
  purpose?: string
  year?: number
}

type ListTripsParams = ListTripsFilterParams & {
  businessId: string
  cursor?: string
  limit?: number
}

const ListTripsResponseSchema = PaginatedResponseSchema(TripSchema)

const listTrips = getWithQuery<
  typeof ListTripsResponseSchema.Encoded,
  ListTripsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/trips`,
  ({ cursor, limit, query, vehicleId, purpose, year }) => ({
    cursor,
    limit,
    q: query,
    vehicle_ids: vehicleId,
    purpose,
    year,
  }),
)

export const useListTrips = createInfiniteQueryHook({
  tags: [LIST_TRIPS_TAG_KEY],
  request: listTrips,
  schema: ListTripsResponseSchema,
  keyDefaults: { limit: 200 },
})

export const useTripsGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Trip>(LIST_TRIPS_TAG_KEY)
