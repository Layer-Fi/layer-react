import { pipe, Schema } from 'effect'

import { TransformedTagDimensionStrictnessSchema } from '@schemas/features/tags/tagDimensionStrictness'
import { TagValueDefinitionSchema } from '@schemas/features/tags/tagValueDefinition'

export const TagDimensionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  displayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('display_name')),
  strictness: TransformedTagDimensionStrictnessSchema,
  definedValues: Schema.propertySignature(Schema.Array(TagValueDefinitionSchema)).pipe(Schema.fromKey('defined_values')),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),
  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),
  userVisible: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('user_visible'),
  ),
})
export type TagDimension = typeof TagDimensionSchema.Type
