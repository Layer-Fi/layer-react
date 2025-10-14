import { PaginatedResponseMetaSchema } from '../types/utility/pagination'
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
  ADHOC = 'ADHOC',
}

// Schema definitions for the enums
const CallBookingStateSchema = Schema.Enums(CallBookingState)

const CallBookingTypeSchema = Schema.Enums(CallBookingType)

const CallBookingPurposeSchema = Schema.Enums(CallBookingPurpose)

// Helper function to create transformed enum schemas with safe defaults
const createTransformedEnumSchema = <T extends Record<string, string>>(
  enumSchema: Schema.Schema<T[keyof T], T[keyof T]>,
  enumObject: T,
  defaultValue: T[keyof T],
) => {
  return Schema.transform(
    Schema.NonEmptyTrimmedString,
    Schema.typeSchema(enumSchema),
    {
      strict: false,
      decode: (input) => {
        if (Object.values(enumObject).includes(input as T[keyof T])) {
          return input as T[keyof T]
        }
        return defaultValue
      },
      encode: input => input,
    },
  )
}

// Transformed schemas with safe defaults for unknown values
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

// Base CallBooking schema without the transform
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

// List response schema
export const ListCallBookingsResponseSchema = Schema.Struct({
  data: Schema.Array(CallBookingSchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})

export type ListCallBookingsResponse = typeof ListCallBookingsResponseSchema.Type

// Single item response schema (for create/update operations)
export const CallBookingItemResponseSchema = Schema.Struct({
  data: CallBookingSchema,
})

export type CallBookingItemResponse = typeof CallBookingItemResponseSchema.Type

// Create call booking request schema
const CreateCallBookingBodySchemaDefinition = Schema.Struct({
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
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
