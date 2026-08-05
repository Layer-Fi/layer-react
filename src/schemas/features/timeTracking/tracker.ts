import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'

export const StartTrackerSchema = Schema.Struct({
  serviceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('service_id'),
  ),

  customerId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('customer_id'),
  ),

  customerExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('customer_external_id'),
  ),

  billable: Schema.optional(Schema.Boolean),

  description: Schema.NullishOr(Schema.String),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),
})

export const StopTrackerSchema = Schema.Struct({
  date: CalendarDateSchema,
})

export type StartTracker = typeof StartTrackerSchema.Type
export type StartTrackerEncoded = typeof StartTrackerSchema.Encoded

export type StopTracker = typeof StopTrackerSchema.Type
export type StopTrackerEncoded = typeof StopTrackerSchema.Encoded
