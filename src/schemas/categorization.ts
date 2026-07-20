import { pipe, Schema } from 'effect'

import { type AccountIdentifier, AccountIdentifierSchema, makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import { CustomerSchema } from '@schemas/customer'
import { TransactionTagSchema } from '@schemas/tag'
import { VendorSchema } from '@schemas/vendor'

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

export type SplitCategorization = typeof SplitCategorizationSchema.Type
export type Categorization = typeof CategorizationSchema.Type

export const isSplitCategorization = (categorization: Categorization): categorization is SplitCategorization => {
  return categorization.type === 'Split_Categorization'
}

export type NestedCategorization = typeof NestedCategorizationSchema.Type

export const CategoryListSchema = Schema.Struct({
  type: Schema.Literal('Category_List'),
  categories: Schema.mutable(Schema.Array(NestedCategorizationSchema)),
})

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
export type Exclusion = typeof ExclusionSchema.Type

export const makeExclusion = (exclusionType: string) =>
  Schema.decodeSync(ExclusionSchema)({ type: 'Exclusion', exclusion_type: exclusionType })

export const ClassificationSchema = Schema.Union(
  AccountIdentifierSchema,
  ExclusionSchema,
)

export const isClassificationExclusion = (value: Classification): value is Exclusion => {
  return value.type === 'Exclusion'
}

export const isClassificationAccountIdentifier = (value: Classification): value is AccountIdentifier => {
  return value.type === 'StableName' || value.type === 'AccountId'
}

export const ClassificationEquivalence = Schema.equivalence(ClassificationSchema)
export type Classification = typeof ClassificationSchema.Type

export const getClassificationFromCategorization = (categorization: Categorization): Classification | null => {
  switch (categorization.type) {
    case 'Account':
      return categorization.stableName !== null ? makeStableName(categorization.stableName) : makeAccountId(categorization.id)
    case 'Exclusion':
      return makeExclusion(categorization.category)
    case 'Split_Categorization':
      return null
  }
}
