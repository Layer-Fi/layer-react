import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/accountIdentifier'

export const CatalogServiceSchema = Schema.Struct({
  id: Schema.UUID,

  name: Schema.String,

  billableRatePerHourAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),
})
export type CatalogService = typeof CatalogServiceSchema.Type

export const CreateCatalogServiceSchema = Schema.Struct({
  name: Schema.String,

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  accountIdentifier: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('account_identifier'),
  ),

  billableRatePerHourAmount: Schema.optional(Schema.Number).pipe(
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),
})
export type CreateCatalogService = typeof CreateCatalogServiceSchema.Type
export type CreateCatalogServiceEncoded = typeof CreateCatalogServiceSchema.Encoded

export const UpdateCatalogServiceSchema = Schema.Struct({
  name: Schema.optional(Schema.String),

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  accountIdentifier: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('account_identifier'),
  ),

  billableRatePerHourAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),
})
export type UpdateCatalogService = typeof UpdateCatalogServiceSchema.Type
export type UpdateCatalogServiceEncoded = typeof UpdateCatalogServiceSchema.Encoded
