import { Schema, pipe } from 'effect'
import { AccountIdSchema, AccountStableNameSchema } from './generalLedger/ledgerAccount'

export const BaseApiCategorizationSchema = Schema.Struct({
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
})

export const AccountCategorizationSchema = Schema.Struct({
  accountId: pipe(
    Schema.propertySignature(AccountIdSchema),
    Schema.fromKey('id'),
  ),
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(AccountStableNameSchema)),
    Schema.fromKey('stable_name'),
  ),
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
})

export const ExclusionCategorizationSchema = Schema.Struct({
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
})

export const AccountSplitEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: AccountCategorizationSchema,
})

export const ExclusionSplitEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: ExclusionCategorizationSchema,
})

export const SplitCategorizationEntrySchema = Schema.Union(
  AccountSplitEntrySchema,
  ExclusionSplitEntrySchema,
)

export const SplitCategorizationSchema = Schema.Struct({
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
  entries: Schema.Array(SplitCategorizationEntrySchema),
})

const nestedAccountCategorizationFields = {
  accountId: pipe(
    Schema.propertySignature(AccountIdSchema),
    Schema.fromKey('id'),
  ),
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(AccountStableNameSchema)),
    Schema.fromKey('stable_name'),
  ),
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
}

const nestedOptionalCategorizationFields = {
  stableName: pipe(
    Schema.propertySignature(AccountStableNameSchema),
    Schema.fromKey('stable_name'),
  ),
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
}

const nestedExclusionCategorizationFields = {
  id: Schema.String,
  category: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  description: Schema.NullOr(Schema.String),
}

export interface NestedAccountCategorization extends Schema.Struct.Type<typeof nestedAccountCategorizationFields> {
  subCategories: NestedApiCategorization[] | null
}

export interface NestedAccountCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedAccountCategorizationFields> {
  sub_categories: NestedApiCategorizationEncoded[] | null
}

export interface NestedOptionalCategorization extends Schema.Struct.Type<typeof nestedOptionalCategorizationFields> {
  subCategories: NestedApiCategorization[] | null
}

export interface NestedOptionalCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedOptionalCategorizationFields> {
  sub_categories: NestedApiCategorizationEncoded[] | null
}

export interface NestedExclusionCategorization extends Schema.Struct.Type<typeof nestedExclusionCategorizationFields> {
  subCategories: NestedApiCategorization[] | null
}

export interface NestedExclusionCategorizationEncoded extends Schema.Struct.Encoded<typeof nestedExclusionCategorizationFields> {
  sub_categories: NestedApiCategorizationEncoded[] | null
}

export type NestedApiCategorization = NestedAccountCategorization | NestedOptionalCategorization | NestedExclusionCategorization
export type NestedApiCategorizationEncoded = NestedAccountCategorizationEncoded | NestedOptionalCategorizationEncoded | NestedExclusionCategorizationEncoded

export const NestedAccountCategorizationSchema = Schema.Struct({
  ...nestedAccountCategorizationFields,
  subCategories: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedApiCategorizationSchema),
    ))),
    Schema.fromKey('sub_categories'),
  ),
})

export const NestedOptionalCategorizationSchema = Schema.Struct({
  ...nestedOptionalCategorizationFields,
  subCategories: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedApiCategorizationSchema),
    ))),
    Schema.fromKey('sub_categories'),
  ),
})

export const NestedExclusionCategorizationSchema = Schema.Struct({
  ...nestedExclusionCategorizationFields,
  subCategories: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedApiCategorization, NestedApiCategorizationEncoded> => NestedApiCategorizationSchema),
    ))),
    Schema.fromKey('sub_categories'),
  ),
})

export const NestedApiCategorizationSchema = Schema.Union(
  NestedAccountCategorizationSchema,
  NestedOptionalCategorizationSchema,
  NestedExclusionCategorizationSchema,
)

export const ApiCategorizationSchema = Schema.Union(
  AccountCategorizationSchema,
  ExclusionCategorizationSchema,
  SplitCategorizationSchema,
)

export type BaseApiCategorization = typeof BaseApiCategorizationSchema.Type
export type AccountCategorization = typeof AccountCategorizationSchema.Type
export type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type
export type AccountSplitEntry = typeof AccountSplitEntrySchema.Type
export type ExclusionSplitEntry = typeof ExclusionSplitEntrySchema.Type
export type SplitCategorizationEntry = typeof SplitCategorizationEntrySchema.Type
export type SplitCategorization = typeof SplitCategorizationSchema.Type
export type ApiCategorization = typeof ApiCategorizationSchema.Type
