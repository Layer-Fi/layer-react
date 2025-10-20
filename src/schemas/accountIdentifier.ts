import { Schema, pipe } from 'effect'

const StableNameSchema = Schema.Struct({
  type: Schema.Literal('StableName'),
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
})

const AccountIdSchema = Schema.Struct({
  type: Schema.Literal('AccountId'),
  id: Schema.String,
})

export const AccountIdentifierSchema = Schema.Union(
  StableNameSchema,
  AccountIdSchema,
)

export type AccountId = typeof AccountIdSchema.Type
export type AccountStableName = typeof StableNameSchema.Type
export type AccountIdentifier = typeof AccountIdentifierSchema.Type
export type AccountIdentifierEncoded = typeof AccountIdentifierSchema.Encoded

export const makeStableName = (stableName: string) =>
  Schema.decodeSync(StableNameSchema)({ type: 'StableName', stable_name: stableName })

export const makeAccountId = (id: string) =>
  Schema.decodeSync(AccountIdSchema)({ type: 'AccountId', id })

export const AccountIdEquivalence = Schema.equivalence(AccountIdSchema)
export const AccountStableNameEquivalence = Schema.equivalence(StableNameSchema)
export const AccountIdentifierEquivalence = Schema.equivalence(AccountIdentifierSchema)
