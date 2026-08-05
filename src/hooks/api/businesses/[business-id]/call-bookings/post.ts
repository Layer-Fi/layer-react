import { CallBookingItemResponseSchema } from '@schemas/features/bookkeeping/callBooking'
import { type CreateCallBookingBodyEncoded } from '@schemas/features/bookkeeping/createCallBookingBody'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useCallBookingsGlobalCacheActions } from '@api/businesses/[business-id]/call-bookings/get'

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
