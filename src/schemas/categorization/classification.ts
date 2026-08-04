import { pipe, Schema } from 'effect'

import { type Categorization } from '@schemas/categorization/categorization'
import { type AccountIdentifier, AccountIdentifierSchema, makeAccountId, makeStableName } from '@schemas/common/accountIdentifier'

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
