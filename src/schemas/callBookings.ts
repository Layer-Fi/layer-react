import { Schema, pipe } from 'effect'

// Enums matching the frontend types
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
  BOOKKEEPING = 'BOOKKEEPING',
}

// Schema definitions for the enums
const CallBookingStateSchema = Schema.Literal(
  'SCHEDULED',
  'CANCELLED',
  'COMPLETED',
)

const CallBookingTypeSchema = Schema.Literal(
  'ZOOM',
  'GOOGLE_MEET',
)

const CallBookingPurposeSchema = Schema.Literal(
  'BOOKKEEPING_ONBOARDING',
  'BOOKKEEPING',
)

// Transformed schemas with safe defaults for unknown values
const TransformedCallBookingStateSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CallBookingStateSchema),
  {
    decode: (input) => {
      if (CallBookingStateSchema.literals.includes(input as CallBookingState)) {
        return input as CallBookingState
      }
      return 'SCHEDULED' // Safe default for unknown values
    },
    encode: input => input,
  },
)

const TransformedCallBookingTypeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CallBookingTypeSchema),
  {
    decode: (input) => {
      if (CallBookingTypeSchema.literals.includes(input as CallBookingType)) {
        return input as CallBookingType
      }
      return 'ZOOM' // Safe default for unknown values
    },
    encode: input => input,
  },
)

const TransformedCallBookingPurposeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CallBookingPurposeSchema),
  {
    decode: (input) => {
      if (CallBookingPurposeSchema.literals.includes(input as CallBookingPurpose)) {
        return input as CallBookingPurpose
      }
      return 'BOOKKEEPING_ONBOARDING' // Safe default for unknown values
    },
    encode: input => input,
  },
)

// Main CallBooking schema
export const CallBookingSchema = Schema.Struct({
  id: Schema.String,

  businessId: pipe(
    Schema.propertySignature(Schema.String),
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
    Schema.propertySignature(Schema.String),
    Schema.fromKey('event_start_at'),
  ),

  location: Schema.String,

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
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('deleted_at'),
  ),
})

export type CallBooking = typeof CallBookingSchema.Type

// List response schema
export const ListCallBookingsResponseSchema = Schema.Struct({
  data: Schema.Array(CallBookingSchema),
  meta: Schema.Struct({
    pagination: Schema.Struct({
      cursor: Schema.NullOr(Schema.String).pipe(Schema.optional),

      hasMore: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('has_more'),
      ),
    }),
  }),
})

export type ListCallBookingsResponse = typeof ListCallBookingsResponseSchema.Type

// Single item response schema (for create/update operations)
export const CallBookingItemResponseSchema = Schema.Struct({
  data: CallBookingSchema,
})

export type CallBookingItemResponse = typeof CallBookingItemResponseSchema.Type
