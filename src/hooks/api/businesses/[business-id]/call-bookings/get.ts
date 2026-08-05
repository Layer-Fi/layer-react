import type { CallBooking } from '@schemas/bookkeeping/callBooking'
import { CallBookingPurpose, CallBookingState, CallBookingType, ListCallBookingsResponseSchema } from '@schemas/bookkeeping/callBooking'
import type { CreateCallBookingBody } from '@schemas/bookkeeping/createCallBookingBody'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export type { CallBooking, CreateCallBookingBody }
export { CallBookingPurpose, CallBookingState, CallBookingType }

type ListCallBookingsParams = {
  businessId: string
  cursor?: string
  limit?: number
}

const listCallBookings = getWithQuery<
  typeof ListCallBookingsResponseSchema.Encoded,
  ListCallBookingsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/call-bookings`,
  ({ cursor, limit }) => ({
    cursor,
    limit,
    status: 'SCHEDULED',
  }),
)

export const CALL_BOOKINGS_TAG_KEY = '#call-bookings'

export const useGetListCallBookings = createInfiniteQueryHook({
  tags: [CALL_BOOKINGS_TAG_KEY],
  request: listCallBookings,
  schema: ListCallBookingsResponseSchema,
})

export const useCallBookingsGlobalCacheActions = createInfiniteQueryGlobalCacheActions<CallBooking>(CALL_BOOKINGS_TAG_KEY)
