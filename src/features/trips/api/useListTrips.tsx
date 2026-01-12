import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'

import { PaginatedResponseMetaSchema } from '@internal-types/utility/pagination'
import { type Trip, TripSchema } from '@schemas/trip'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_TRIPS_TAG_KEY = '#list-trips'

export type ListTripsFilterParams = {
  query?: string
  vehicleId?: string
  purpose?: string
  year?: number
}

const ListTripsResponseSchema = Schema.Struct({
  data: Schema.Array(TripSchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})
type ListTripsResponse = typeof ListTripsResponseSchema.Type

class ListTripsSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListTripsResponse>

  constructor(swrResponse: SWRInfiniteResponse<ListTripsResponse>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get size() {
    return this.swrResponse.size
  }

  get setSize() {
    return this.swrResponse.setSize
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

function keyLoader(
  previousPageData: ListTripsResponse | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    query,
    vehicleId,
    purpose,
    year,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    query?: string
    vehicleId?: string
    purpose?: string
    year?: number
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta?.pagination.cursor ?? undefined,
      query,
      vehicleId,
      purpose,
      year,
      tags: [LIST_TRIPS_TAG_KEY],
    } as const
  }
}

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
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListTripsResponse | null) => keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        ...filterParams,
      },
    ),
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

  return new ListTripsSWRResponse(swrResponse)
}

const withUpdatedTrip = (updated: Trip) =>
  (trip: Trip): Trip => trip.id === updated.id ? updated : trip

export function useTripsGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchTripByKey = useCallback((updatedTrip: Trip) =>
    patchCache<ListTripsResponse[] | ListTripsResponse | undefined>(
      ({ tags }) => tags.includes(LIST_TRIPS_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListTripsResponse): ListTripsResponse => ({
          ...page,
          data: page.data.map(withUpdatedTrip(updatedTrip)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadTrips = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_TRIPS_TAG_KEY)),
    [forceReload],
  )

  return { patchTripByKey, forceReloadTrips }
}
