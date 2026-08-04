import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'

export const UpsertTimeEntrySchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),

  date: CalendarDateSchema,

  durationMinutes: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('duration_minutes'),
  ),

  billable: Schema.Boolean,

  description: Schema.NullishOr(Schema.String),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),

  customerId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('customer_id'),
  ),

  serviceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('service_id'),
  ),
})

export type UpsertTimeEntry = typeof UpsertTimeEntrySchema.Type
export type UpsertTimeEntryEncoded = typeof UpsertTimeEntrySchema.Encoded
