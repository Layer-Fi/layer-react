import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import {
  type CallBookingItemResponse,
  CallBookingItemResponseSchema,
  type CreateCallBookingBodyEncoded,
} from '@schemas/callBooking'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useCallBookingsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CREATE_CALL_BOOKING_TAG_KEY = '#create-call-booking'

const createCallBooking = post<
  CallBookingItemResponse,
  CreateCallBookingBodyEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

function buildKey({
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
      tags: [CREATE_CALL_BOOKING_TAG_KEY],
    } as const
  }
}

export function useCreateCallBooking() {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCallBookings } = useCallBookingsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateCallBookingBodyEncoded },
    ) => createCallBooking(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(CallBookingItemResponseSchema)),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = rawMutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadCallBookings()

      return triggerResult
    },
    [originalTrigger, forceReloadCallBookings],
  )

  const proxiedMutationResponse = new Proxy(rawMutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })

  return new SWRMutationResult(proxiedMutationResponse)
}
