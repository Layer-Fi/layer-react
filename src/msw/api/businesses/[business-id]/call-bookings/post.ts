import { Schema } from 'effect'

import {
  type CallBooking,
  CallBookingItemResponseSchema,
  CallBookingState,
  CreateCallBookingBodySchema,
} from '@schemas/callBooking'

import { callBookingStore } from '@msw/api/businesses/[business-id]/call-bookings/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeBusiness } from '@fixtures/business/mocks'

const decodeCreateCallBookingBody = Schema.decodeUnknownSync(CreateCallBookingBodySchema)
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

    // The schema encodes businessId as a UUID; fall back for non-UUID test params.
    const businessId = String(params.businessId)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId)

    const now = new Date()
    const booking: CallBooking = {
      id: crypto.randomUUID(),
      businessId: isUuid ? businessId : makeBusiness().id,
      externalId,
      purpose,
      state: CallBookingState.SCHEDULED,
      callType,
      eventStartAt: new Date(now.getTime() + 24 * HOUR_MS),
      eventEndAt: new Date(now.getTime() + 25 * HOUR_MS),
      callLink: new URL('https://meet.example.com/mock-call-booking'),
      bookkeeperName: 'Alex Morgan',
      bookkeeperEmail: 'alex.morgan@example.com',
      createdAt: now,
      updatedAt: now,
    }
    callBookingStore.save(booking)

    return encodeCallBookingItemResponse({ data: booking })
  },
})
