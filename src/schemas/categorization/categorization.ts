import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customerVendor/customer'
import { VendorSchema } from '@schemas/customerVendor/vendor'
import { TransactionTagSchema } from '@schemas/tags/tag'

export const AccountCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Account'),
  id: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ),
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
})

export const ExclusionCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Exclusion'),
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
})

export const AccountSplitEntrySchema = Schema.Struct({
  type: Schema.Literal('AccountSplitEntry'),
  amount: Schema.Number,
  category: AccountCategorizationSchema,
  taxCode: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('tax_code'),
  ),
  tags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('tags'),
  ),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
})

export const ExclusionSplitEntrySchema = Schema.Struct({
  type: Schema.Literal('ExclusionSplitEntry'),
  amount: Schema.Number,
  category: ExclusionCategorizationSchema,
  taxCode: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('tax_code'),
  ),
  tags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('tags'),
  ),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
})

export const SplitCategorizationEntrySchema = Schema.Union(
  AccountSplitEntrySchema,
  ExclusionSplitEntrySchema,
)

export const SplitCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Split_Categorization'),
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  entries: Schema.mutable(Schema.Array(SplitCategorizationEntrySchema)),
})

export const CategorizationSchema = Schema.Union(
  AccountCategorizationSchema,
  ExclusionCategorizationSchema,
  SplitCategorizationSchema,
)

export type SplitCategorization = typeof SplitCategorizationSchema.Type
export type Categorization = typeof CategorizationSchema.Type

export const isSplitCategorization = (categorization: Categorization): categorization is SplitCategorization => {
  return categorization.type === 'Split_Categorization'
}
