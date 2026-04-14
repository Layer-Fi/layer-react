import { pipe, Schema } from 'effect'

export const CatalogServiceSchema = Schema.Struct({
  id: Schema.UUID,

  name: Schema.String,

  billableRatePerHourAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  archivedAt: Schema.optional(Schema.NullOr(Schema.Date)).pipe(
    Schema.fromKey('archived_at'),
  ),
})
export type CatalogService = typeof CatalogServiceSchema.Type

export const CreateCatalogServiceSchema = Schema.Struct({
  name: Schema.String,

  externalId: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),

  accountIdentifier: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('account_identifier'),
  ),

  billableRatePerHourAmount: Schema.optional(Schema.NullOr(Schema.Number)).pipe(
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  memo: Schema.optional(Schema.NullOr(Schema.String)),

  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})
export type CreateCatalogService = typeof CreateCatalogServiceSchema.Type
export type CreateCatalogServiceEncoded = typeof CreateCatalogServiceSchema.Encoded

export const UpdateCatalogServiceSchema = Schema.Struct({
  name: Schema.optional(Schema.String),

  externalId: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),

  accountIdentifier: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('account_identifier'),
  ),

  billableRatePerHourAmount: Schema.optional(Schema.NullOr(Schema.Number)).pipe(
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  memo: Schema.optional(Schema.NullOr(Schema.String)),

  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})
export type UpdateCatalogService = typeof UpdateCatalogServiceSchema.Type
export type UpdateCatalogServiceEncoded = typeof UpdateCatalogServiceSchema.Encoded
