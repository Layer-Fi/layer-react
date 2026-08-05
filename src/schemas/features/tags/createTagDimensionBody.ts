import { Schema } from 'effect'

import { TagDimensionStrictnessSchema } from '@schemas/features/tags/tagDimensionStrictness'

export const CreateTagDimensionBodySchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  strictness: TagDimensionStrictnessSchema,
  displayName: Schema.optional(Schema.NonEmptyTrimmedString),
  definedValues: Schema.propertySignature(Schema.Array(Schema.NonEmptyTrimmedString))
    .pipe(Schema.fromKey('defined_values')),
})
