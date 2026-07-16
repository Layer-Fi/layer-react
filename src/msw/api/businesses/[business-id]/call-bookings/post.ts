import { Schema } from 'effect'

import {
  type CallBooking,
  CallBookingItemResponseSchema,
  CallBookingSchema,
  CallBookingState,
  CreateCallBookingBodySchema,
} from '@schemas/callBooking'

import { callBookingStore } from '@msw/api/businesses/[business-id]/call-bookings/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeCreateCallBookingBody = Schema.decodeUnknownSync(CreateCallBookingBodySchema)
const decodeCallBooking = Schema.decodeSync(CallBookingSchema)
const encodeCallBookingItemResponse = Schema.encodeSync(CallBookingItemResponseSchema)

const HOUR_MS = 60 * 60 * 1000

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/call-bookings',
  resolve: async (
    { override, request, params }:
    { override?: CallBooking, request: Request, params: { businessId?: string | readonly string[] } },
  ) => {
    if (override) return encodeCallBookingItemResponse({ data: override })

    const { externalId, purpose, callType } = decodeCreateCallBookingBody(await readRequestJson(request))

    const now = new Date()
    const booking = decodeCallBooking({
      id: crypto.randomUUID(),
      business_id: String(params.businessId),
      external_id: externalId,
      purpose,
      state: CallBookingState.SCHEDULED,
      call_type: callType,
      event_start_at: new Date(now.getTime() + 24 * HOUR_MS).toISOString(),
      event_end_at: new Date(now.getTime() + 25 * HOUR_MS).toISOString(),
      call_link: 'https://meet.example.com/mock-call-booking',
      bookkeeper_name: 'Alex Morgan',
      bookkeeper_email: 'alex.morgan@example.com',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })

    // One upcoming call at a time: a new booking replaces any existing one.
    callBookingStore.all().forEach(({ id }) => callBookingStore.deleteById(id))
    callBookingStore.save(booking)

    return encodeCallBookingItemResponse({ data: booking })
  },
})
