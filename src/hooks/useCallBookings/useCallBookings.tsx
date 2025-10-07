import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import useSWRMutation from 'swr/mutation'
import { useSWRConfig } from 'swr'
import { useCallback } from 'react'
import { Schema } from 'effect'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get, post } from '../../api/layer/authenticated_http'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import {
  CallBookingState,
  CallBookingType,
  CallBookingPurpose,
  CallBookingItemResponseSchema,
  ListCallBookingsResponseSchema,
} from '../../schemas/callBookings'
import type { CallBooking, ListCallBookingsResponse } from '../../schemas/callBookings'

export type { CallBooking }
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
  })

  return `/v1/businesses/${businessId}/call-bookings?${parameters}`
})

type CreateCallBookingBody = {
  external_id: string
  purpose: CallBookingPurpose
  call_type: CallBookingType
  event_start_at?: string
  location?: string
  cancellation_reason?: string
}

const createCallBooking = post<
  Record<string, unknown>,
  CreateCallBookingBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

export const CALL_BOOKINGS_TAG_KEY = '#call-bookings'

function keyLoader(
  previousPageData: ListCallBookingsResponse | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    isEnabled,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    isEnabled?: boolean
  },
) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta.pagination.cursor ?? undefined,
      tags: [CALL_BOOKINGS_TAG_KEY],
    } as const
  }
}

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

type UseCallBookingsParams = {
  isEnabled?: boolean
}

export function useCallBookings({ isEnabled = true }: UseCallBookingsParams = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCallBookingsResponse | null) => keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        isEnabled,
      },
    ),
    ({ accessToken, apiUrl, businessId, cursor }) => listCallBookings(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 5,
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

export function usePreloadCallBookings(parameters?: UseCallBookingsParams) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useCallBookings(parameters)
}

function buildCreateKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${CALL_BOOKINGS_TAG_KEY}:create`],
    } as const
  }
}

export function useCreateCallBooking() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildCreateKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateCallBookingBody },
    ) => createCallBooking(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    )
      .then(Schema.decodeUnknownPromise(CallBookingItemResponseSchema))
      .then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(CALL_BOOKINGS_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
