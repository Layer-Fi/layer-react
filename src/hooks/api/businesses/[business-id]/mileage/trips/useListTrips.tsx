import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Trip, TripSchema } from '@schemas/trip'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_TRIPS_TAG_KEY = '#list-trips'

export type ListTripsFilterParams = {
  query?: string
  vehicleId?: string
  purpose?: string
  year?: number
}

const ListTripsResponseSchema = PaginatedResponseSchema(TripSchema)
type ListTripsResponse = typeof ListTripsResponseSchema.Type

const keyLoader = createInfiniteKeyLoader<
  ListTripsFilterParams & { businessId: string },
  ListTripsResponse
>([LIST_TRIPS_TAG_KEY])

const listTrips = get<
  typeof ListTripsResponseSchema.Encoded,
  { businessId: string, cursor?: string, limit?: number, query?: string, vehicleId?: string, purpose?: string, year?: number }
>(({ businessId, cursor, limit, query, vehicleId, purpose, year }) => {
  const parameters = toDefinedSearchParameters({
    cursor,
    limit,
    q: query,
    vehicle_ids: vehicleId,
    purpose,
    year,
  })
  const baseUrl = `/v1/businesses/${businessId}/mileage/trips`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

export function useListTrips(filterParams: ListTripsFilterParams = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListTripsResponse | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        ...filterParams,
      },
    )),
    ({ accessToken, apiUrl, businessId, cursor, query, vehicleId, purpose, year }) => listTrips(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 200,
          query,
          vehicleId,
          purpose,
          year,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListTripsResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export const useTripsGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Trip>(LIST_TRIPS_TAG_KEY)
