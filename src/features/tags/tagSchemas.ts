import { Schema, pipe } from 'effect'

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
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),
})
export type TagValueDefinition = typeof TagValueDefinitionSchema.Type

export const TagKeyValueSchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
})
export const makeTagKeyValue = Schema.decodeSync(TagKeyValueSchema)

export const TagDimensionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  strictness: TransformedTagDimensionStrictnessSchema,
  definedValues: Schema.propertySignature(Schema.Array(TagValueDefinitionSchema))
    .pipe(Schema.fromKey('defined_values')),
})
export type TagDimension = typeof TagDimensionSchema.Type

const TagValueSchema = Schema.Data(
  Schema.Struct({
    dimensionId: Schema.UUID,
    dimensionLabel: Schema.NonEmptyTrimmedString,
    valueId: Schema.UUID,
    valueLabel: Schema.NonEmptyTrimmedString,
  }),
)
export const makeTagValue = Schema.decodeSync(TagValueSchema)
export type TagValue = typeof TagValueSchema.Type

export const TagSchema = Schema.Data(
  Schema.Struct({
    id: Schema.UUID,
    dimensionLabel: Schema.NonEmptyTrimmedString,
    valueLabel: Schema.NonEmptyTrimmedString,
    archivedAt: Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    _local: Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
  }),
)
export const makeTag = Schema.decodeSync(TagSchema)
export type Tag = typeof TagSchema.Type

export const TransactionTagSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('deleted_at'),
  ),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),

  _local: Schema.optional(
    Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
  ),
})

export type TransactionTag = typeof TransactionTagSchema.Type
export type TransactionTagEncoded = typeof TransactionTagSchema.Encoded

export const makeTagKeyValueFromTag = ({ dimensionLabel, valueLabel }: Tag) => makeTagKeyValue({
  key: dimensionLabel,
  value: valueLabel,
})

export const makeTagFromTransactionTag = ({ id, key, value, _local, archivedAt }: TransactionTag) => makeTag({
  id,
  dimensionLabel: key,
  valueLabel: value,
  archivedAt: archivedAt?.toISOString() ?? null,
  _local: {
    isOptimistic: _local?.isOptimistic ?? false,
  },
})
