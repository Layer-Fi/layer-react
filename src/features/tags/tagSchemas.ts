import { Schema } from 'effect'

export const TagDimensionStrictnessSchema = Schema.Literal(
  'BALANCING',
  'NON_BALANCING',
)
type TagDimensionStrictness = Schema.Schema.Type<typeof TagDimensionStrictnessSchema>

const TransformedTagDimensionStrictnessSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  TagDimensionStrictnessSchema,
  {
    decode: (input) => {
      if (TagDimensionStrictnessSchema.literals.includes(input as TagDimensionStrictness)) {
        return input as TagDimensionStrictness
      }

      return 'BALANCING'
    },
    encode: input => input,
  },
)

export const TagValueDefinitionSchema = Schema.Struct({
  id: Schema.UUID,
  value: Schema.NonEmptyTrimmedString,
})

export const TagDimensionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  strictness: TransformedTagDimensionStrictnessSchema,
  definedValues: Schema.propertySignature(Schema.Array(TagValueDefinitionSchema))
    .pipe(Schema.fromKey('defined_values')),
})
