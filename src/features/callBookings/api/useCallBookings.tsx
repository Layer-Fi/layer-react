import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import { Schema } from 'effect'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { get } from '../../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'
import {
  CallBookingState,
  CallBookingType,
  CallBookingPurpose,
  ListCallBookingsResponseSchema,
} from '../../../schemas/callBookings'
import type {
  CallBooking,
  ListCallBookingsResponse,
  CreateCallBookingBody,
} from '../../../schemas/callBookings'

export type { CallBooking, CreateCallBookingBody }
export { CallBookingState, CallBookingType, CallBookingPurpose }

type ListCallBookingsParams = {
  businessId: string
  cursor?: string
  limit?: number
}

const listCallBookings = get<
  Record<string, unknown>,
  ListCallBookingsParams
>(({ businessId, cursor, limit }) => {
  const parameters = toDefinedSearchParameters({
    cursor,
    limit,
    status: 'SCHEDULED',
  })

  return `/v1/businesses/${businessId}/call-bookings?${parameters}`
})

class ListCallBookingsSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListCallBookingsResponse>

  constructor(swrResponse: SWRInfiniteResponse<ListCallBookingsResponse>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
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
  previousPageData: ListCallBookingsResponse | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    limit,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    limit?: number
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta.pagination.cursor ?? undefined,
      limit,
      tags: [CALL_BOOKINGS_TAG_KEY],
    } as const
  }
}

export function useCallBookings(limit?: number) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCallBookingsResponse | null) => keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        limit,
      },
    ),
    ({ accessToken, apiUrl, businessId, cursor, limit }) => listCallBookings(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCallBookingsResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  return new ListCallBookingsSWRResponse(swrResponse)
}

export const CALL_BOOKINGS_TAG_KEY = '#call-bookings'
