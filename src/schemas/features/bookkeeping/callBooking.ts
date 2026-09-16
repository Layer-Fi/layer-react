import { pipe, Schema } from 'effect'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { createTransformedEnumSchema } from '@schemas/common/utils'

export enum CallBookingState {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum CallBookingType {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
}

export enum CallBookingPurpose {
  BOOKKEEPING_ONBOARDING = 'BOOKKEEPING_ONBOARDING',
  ADHOC = 'ADHOC',
}

const CallBookingStateSchema = Schema.Enums(CallBookingState)

export const CallBookingTypeSchema = Schema.Enums(CallBookingType)

export const CallBookingPurposeSchema = Schema.Enums(CallBookingPurpose)

const TransformedCallBookingStateSchema = createTransformedEnumSchema(
  CallBookingStateSchema,
  CallBookingState,
  CallBookingState.SCHEDULED,
)

const TransformedCallBookingTypeSchema = createTransformedEnumSchema(
  CallBookingTypeSchema,
  CallBookingType,
  CallBookingType.GOOGLE_MEET,
)

const TransformedCallBookingPurposeSchema = createTransformedEnumSchema(
  CallBookingPurposeSchema,
  CallBookingPurpose,
  CallBookingPurpose.ADHOC,
)

const CallBookingSchema = Schema.Struct({
  id: Schema.UUID,

  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),

  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),

  purpose: TransformedCallBookingPurposeSchema,

  state: TransformedCallBookingStateSchema,

  callType: pipe(
    Schema.propertySignature(TransformedCallBookingTypeSchema),
    Schema.fromKey('call_type'),
  ),

  eventStartAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('event_start_at'),
  ),

  eventEndAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('event_end_at'),
  ),

  callLink: pipe(
    Schema.propertySignature(Schema.URL),
    Schema.fromKey('call_link'),
  ),

  cancellationReason: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('cancellation_reason'),
  ),

  didAttend: pipe(
    Schema.optional(Schema.NullOr(Schema.Boolean)),
    Schema.fromKey('did_attend'),
  ),

  bookkeeperName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bookkeeper_name'),
  ),

  bookkeeperEmail: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bookkeeper_email'),
  ),

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.optional(Schema.NullOr(Schema.Date)),
    Schema.fromKey('deleted_at'),
  ),
})

export type CallBooking = typeof CallBookingSchema.Type

export const ListCallBookingsResponseSchema = PaginatedResponseSchema(CallBookingSchema)

export type ListCallBookingsResponse = typeof ListCallBookingsResponseSchema.Type

export const CallBookingItemResponseSchema = Schema.Struct({
  data: CallBookingSchema,
})

export type CallBookingItemResponse = typeof CallBookingItemResponseSchema.Type
