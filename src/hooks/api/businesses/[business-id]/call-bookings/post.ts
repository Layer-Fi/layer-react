import {
  CallBookingItemResponseSchema,
  type CreateCallBookingBodyEncoded,
} from '@schemas/bookkeeping/callBooking'
import { post } from '@utils/api/authenticatedHttp'
import { useCallBookingsGlobalCacheActions } from '@api/businesses/[business-id]/call-bookings/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_CALL_BOOKING_TAG_KEY = '#create-call-booking'

const createCallBooking = post<
  typeof CallBookingItemResponseSchema.Encoded,
  CreateCallBookingBodyEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

export const usePostCallBooking = createMutationHook({
  tags: [CREATE_CALL_BOOKING_TAG_KEY],
  request: createCallBooking,
  schema: CallBookingItemResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCallBookings } = useCallBookingsGlobalCacheActions()

    return () => {
      void forceReloadCallBookings()
    }
  },
})
