import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import {
  type CallBookingItemResponse,
  CallBookingItemResponseSchema,
  type CreateCallBookingBodyEncoded,
} from '@schemas/callBooking'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCallBookingsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const CREATE_CALL_BOOKING_TAG_KEY = '#create-call-booking'

const createCallBooking = post<
  CallBookingItemResponse,
  CreateCallBookingBodyEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

const buildKey = createBuildKey<{ businessId: string }>([CREATE_CALL_BOOKING_TAG_KEY])

export function useCreateCallBooking() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { forceReload: forceReloadCallBookings } = useCallBookingsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
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

  const proxiedMutationResponse = withStableTrigger(rawMutationResponse, stableProxiedTrigger)

  return new SWRMutationResult(proxiedMutationResponse)
}
