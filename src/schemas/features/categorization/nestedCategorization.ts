import { pipe, Schema } from 'effect'

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

export type NestedCategorization = typeof NestedCategorizationSchema.Type
