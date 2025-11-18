import { pipe, Schema } from 'effect'

import { type AccountIdentifier, AccountIdentifierSchema } from '@schemas/accountIdentifier'
import { CustomerSchema } from '@schemas/customer'
import { VendorSchema } from '@schemas/vendor'
import { TransactionTagSchema } from '@features/tags/tagSchemas'

export const BaseCategorizationSchema = Schema.Struct({
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
})

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
export const AccountCategorizationEncoded = typeof AccountCategorizationSchema.Encoded

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
export const ExclusionCategorizationEncoded = typeof ExclusionCategorizationSchema.Encoded

export const AccountSplitEntrySchema = Schema.Struct({
  type: Schema.Literal('AccountSplitEntry'),
  amount: Schema.Number,
  category: AccountCategorizationSchema,
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
export type SplitCategorizationEntryEncoded = typeof SplitCategorizationEntrySchema.Encoded

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

const nestedAccountCategorizationFields = {
  type: Schema.Literal('AccountNested'),
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
}

const nestedOptionalCategorizationFields = {
  type: Schema.Literal('OptionalAccountNested'),
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
}

const nestedExclusionCategorizationFields = {
  type: Schema.Literal('ExclusionNested'),
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
}

export interface NestedAccountCategorization extends Schema.Struct.Type<typeof nestedAccountCategorizationFields> {
  subCategories?: NestedApiCategorization[] | null
}

export interface NestedAccountCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedAccountCategorizationFields> {
  subCategories?: NestedApiCategorizationEncoded[] | null
}

export interface NestedOptionalCategorization extends Schema.Struct.Type<typeof nestedOptionalCategorizationFields> {
  subCategories?: NestedApiCategorization[] | null
}

export interface NestedOptionalCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedOptionalCategorizationFields> {
  subCategories?: NestedApiCategorizationEncoded[] | null
}

export interface NestedExclusionCategorization extends Schema.Struct.Type<typeof nestedExclusionCategorizationFields> {
  subCategories?: NestedApiCategorization[] | null
}

export interface NestedExclusionCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedExclusionCategorizationFields> {
  subCategories?: NestedApiCategorizationEncoded[] | null
}

export type NestedApiCategorization = NestedAccountCategorization | NestedOptionalCategorization | NestedExclusionCategorization
export type NestedApiCategorizationEncoded = NestedAccountCategorizationEncoded | NestedOptionalCategorizationEncoded | NestedExclusionCategorizationEncoded

export const NestedAccountCategorizationSchema = Schema.Struct({
  ...nestedAccountCategorizationFields,
  subCategories: Schema.optional(Schema.NullOr(Schema.mutable(Schema.Array(
    Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedCategorizationSchema),
  )))),
})

export const NestedOptionalCategorizationSchema = Schema.Struct({
  ...nestedOptionalCategorizationFields,
  subCategories: Schema.optional(Schema.NullOr(Schema.mutable(Schema.Array(
    Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedCategorizationSchema),
  )))),
})

export const NestedExclusionCategorizationSchema = Schema.Struct({
  ...nestedExclusionCategorizationFields,
  subCategories: Schema.optional(Schema.NullOr(Schema.mutable(Schema.Array(
    Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedCategorizationSchema),
  )))),
})

export const NestedCategorizationSchema = Schema.Union(
  NestedAccountCategorizationSchema,
  NestedOptionalCategorizationSchema,
  NestedExclusionCategorizationSchema,
)

export const CategorizationSchema = Schema.Union(
  AccountCategorizationSchema,
  ExclusionCategorizationSchema,
  SplitCategorizationSchema,
)

export type BaseCategorization = typeof BaseCategorizationSchema.Type
export type AccountCategorization = typeof AccountCategorizationSchema.Type
export type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type
export type AccountSplitEntry = typeof AccountSplitEntrySchema.Type
export type ExclusionSplitEntry = typeof ExclusionSplitEntrySchema.Type
export type SplitCategorizationEntry = typeof SplitCategorizationEntrySchema.Type
export type SplitCategorization = typeof SplitCategorizationSchema.Type
export type Categorization = typeof CategorizationSchema.Type

export type AccountCategorizationEncoded = typeof AccountCategorizationSchema.Encoded
export type ExclusionCategorizationEncoded = typeof ExclusionCategorizationSchema.Encoded
export type SplitCategorizationEncoded = typeof SplitCategorizationSchema.Encoded
export type CategorizationEncoded = typeof CategorizationSchema.Encoded

// Type guards for CategorizationEncoded union
export const isAccountCategorizationEncoded = (categorization: CategorizationEncoded): categorization is AccountCategorizationEncoded => {
  return categorization.type === 'Account'
}

export const isSplitCategorizationEncoded = (categorization: CategorizationEncoded): categorization is SplitCategorizationEncoded => {
  return categorization.type === 'Split_Categorization'
}

export const isExclusionCategorizationEncoded = (categorization: CategorizationEncoded): categorization is ExclusionCategorizationEncoded => {
  return categorization.type === 'Exclusion'
}

export type NestedCategorization = typeof NestedCategorizationSchema.Type

export const isNestedAccountCategorization = (categorization: NestedCategorization): categorization is NestedAccountCategorization => {
  return categorization.type === 'AccountNested'
}

export const isNestedOptionalCategorization = (categorization: NestedCategorization): categorization is NestedOptionalCategorization => {
  return categorization.type === 'OptionalAccountNested'
}

export const isNestedExclusionCategorization = (categorization: NestedCategorization): categorization is NestedExclusionCategorization => {
  return categorization.type === 'ExclusionNested'
}

export const CategoryListSchema = Schema.Struct({
  type: Schema.Literal('Category_List'),
  categories: Schema.mutable(Schema.Array(NestedCategorizationSchema)),
})

export type CategoryList = typeof CategoryListSchema.Type

export enum CategoriesListMode {
  All = 'ALL',
  Expenses = 'EXPENSES',
  Revenue = 'REVENUE',
  Default = 'DEFAULT',
}

export const ExclusionSchema = Schema.Struct({
  type: Schema.Literal('Exclusion'),
  exclusionType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('exclusion_type'),
  ),
})

export const makeExclusion = (exclusionType: string) =>
  Schema.decodeSync(ExclusionSchema)({ type: 'Exclusion', exclusion_type: exclusionType })

export const ClassificationSchema = Schema.Union(
  AccountIdentifierSchema,
  ExclusionSchema,
)

export const isClassificationAccountIdentifier = (value: Classification): value is AccountIdentifier => {
  return value.type === 'StableName' || value.type === 'AccountId'
}

export const ClassificationEquivalence = Schema.equivalence(ClassificationSchema)
export type Classification = typeof ClassificationSchema.Type
export type ClassificationEncoded = typeof ClassificationSchema.Encoded
