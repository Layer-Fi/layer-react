import { pipe, Schema } from 'effect'

export const TransactionTagSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  dimensionDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('dimension_display_name')),
  valueDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('value_display_name')),

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('deleted_at'),
  ),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),

  _local: Schema.optional(
    Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
  ),
})

export type TransactionTag = typeof TransactionTagSchema.Type
export type TransactionTagEncoded = typeof TransactionTagSchema.Encoded
