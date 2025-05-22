import { Schema } from 'effect'

const TagDimensionStrictnessSchema = Schema.Literal(
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

const TagValueSchema = Schema.Struct({
  id: Schema.UUID,
  value: Schema.NonEmptyTrimmedString,
})

export const TagDimensionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  strictness: TransformedTagDimensionStrictnessSchema,
  definedValues: Schema.propertySignature(Schema.Array(TagValueSchema))
    .pipe(Schema.fromKey('defined_values')),
})
