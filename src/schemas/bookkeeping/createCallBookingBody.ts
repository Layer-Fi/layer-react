import { pipe, Schema } from 'effect'

import { CallBookingPurposeSchema, CallBookingTypeSchema } from '@schemas/bookkeeping/callBooking'

// Create call booking request schema
const CreateCallBookingBodySchemaDefinition = Schema.Struct({
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

export const CreateCallBookingBodySchema = CreateCallBookingBodySchemaDefinition
export const encodeCreateCallBookingBody = Schema.encodeSync(CreateCallBookingBodySchemaDefinition)
export type CreateCallBookingBody = typeof CreateCallBookingBodySchemaDefinition.Type
export type CreateCallBookingBodyEncoded = typeof CreateCallBookingBodySchemaDefinition.Encoded
