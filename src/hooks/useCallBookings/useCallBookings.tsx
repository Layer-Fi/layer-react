import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useSWRConfig } from 'swr'
import { useCallback } from 'react'
import { Schema } from 'effect'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get, post } from '../../api/layer/authenticated_http'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import {
  CallBookingState,
  CallBookingType,
  CallBookingPurpose,
  CallBookingItemResponseSchema,
  ListCallBookingsResponseSchema,
} from '../../schemas/callBookings'
import type { CallBooking } from '../../schemas/callBookings'

export type { CallBooking }
export { CallBookingState, CallBookingType, CallBookingPurpose }

const getCallBookings = get<
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/call-bookings`
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

function buildListKey({
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
      tags: [CALL_BOOKINGS_TAG_KEY],
    } as const
  }
}

export function useCallBookings() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildListKey({
      ...auth,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getCallBookings(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(Schema.decodeUnknownPromise(ListCallBookingsResponseSchema))
      .then(({ data }) => data),
  )
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
