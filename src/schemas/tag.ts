import { pipe, Schema } from 'effect'

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

export const TagSchema = Schema.Struct({
  id: Schema.String,
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  dimensionId: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('dimension_id')),
  definitionId: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('definition_id')),
  createdAt: Schema.propertySignature(Schema.Date).pipe(Schema.fromKey('created_at')),
  updatedAt: Schema.propertySignature(Schema.Date).pipe(Schema.fromKey('updated_at')),
  deletedAt: pipe(
    Schema.optional(Schema.Date),
    Schema.fromKey('deleted_at'),
  ),
})

export type Tag = typeof TagSchema.Type

export const TagKeyValueSchema = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
})

export type TagKeyValue = Schema.Schema.Type<typeof TagKeyValueSchema>
