import { useCallback } from 'react'

import {
  CallBookingItemResponseSchema,
  type CreateCallBookingBodyEncoded,
} from '@schemas/callBooking'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCallBookingsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_CALL_BOOKING_TAG_KEY = '#create-call-booking'

const createCallBooking = post<
  typeof CallBookingItemResponseSchema.Encoded,
  CreateCallBookingBodyEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

const useCreateCallBookingMutation = createMutationHook({
  tags: [CREATE_CALL_BOOKING_TAG_KEY],
  request: createCallBooking,
  schema: CallBookingItemResponseSchema,
  swrOptions: { throwOnError: true },
})

export function useCreateCallBooking() {
  const { forceReload: forceReloadCallBookings } = useCallBookingsGlobalCacheActions()

  const mutationResponse = useCreateCallBookingMutation()
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadCallBookings()

      return triggerResult
    },
    [originalTrigger, forceReloadCallBookings],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
