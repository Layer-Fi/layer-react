import { pipe, Schema } from 'effect'

import { CallBookingPurposeSchema, CallBookingTypeSchema } from '@schemas/bookkeeping/callBooking'

export const CreateCallBookingBodySchema = Schema.Struct({
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),

  inviteeId: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('invitee_id'),
  ),

  purpose: CallBookingPurposeSchema,

  callType: pipe(
    Schema.propertySignature(CallBookingTypeSchema),
    Schema.fromKey('call_type'),
  ),
})

export const encodeCreateCallBookingBody = Schema.encodeSync(CreateCallBookingBodySchema)
export type CreateCallBookingBody = typeof CreateCallBookingBodySchema.Type
export type CreateCallBookingBodyEncoded = typeof CreateCallBookingBodySchema.Encoded
