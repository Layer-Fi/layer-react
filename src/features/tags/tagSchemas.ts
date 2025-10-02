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
  displayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('display_name')),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),
})
export type TagValueDefinition = typeof TagValueDefinitionSchema.Type

export const TagKeyValueSchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  dimensionDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('dimension_display_name')),
  valueDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('value_display_name'),
  ),
})
export const makeTagKeyValue = Schema.decodeSync(TagKeyValueSchema)

export const TagDimensionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  displayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('display_name')),
  strictness: TransformedTagDimensionStrictnessSchema,
  definedValues: Schema.propertySignature(Schema.Array(TagValueDefinitionSchema)).pipe(Schema.fromKey('defined_values')),
})
export type TagDimension = typeof TagDimensionSchema.Type

const TagValueSchema = Schema.Data(
  Schema.Struct({
    dimensionId: Schema.UUID,
    dimensionKey: Schema.NonEmptyTrimmedString,
    dimensionDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    valueId: Schema.UUID,
    value: Schema.NonEmptyTrimmedString,
    valueDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    isArchived: Schema.Boolean,
  }),
)
export const makeTagValue = Schema.decodeSync(TagValueSchema)

export type TagValue = typeof TagValueSchema.Type

export const TagSchema = Schema.Data(
  Schema.Struct({
    id: Schema.UUID,
    key: Schema.NonEmptyTrimmedString,
    dimensionDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    value: Schema.NonEmptyTrimmedString,
    valueDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    archivedAt: Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    _local: Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
  }),
)

export function getTagDisplayNameForValue(tag: Tag): string {
  const valueBaseLabel = tag.valueDisplayName ?? tag.value
  const archiveAwareLabel = tag.archivedAt ? `${valueBaseLabel} (Archived)` : valueBaseLabel
  return archiveAwareLabel
}

export function getTagDisplayNameForDimension(tag: Tag): string {
  return tag.dimensionDisplayName ?? tag.key
}

export function getTagValueDisplayNameForValue(tagValue: TagValue): string {
  const valueBaseLabel = tagValue.valueDisplayName ?? tagValue.value
  const archiveAwareLabel = tagValue.isArchived ? `${valueBaseLabel} (Archived)` : valueBaseLabel

  return archiveAwareLabel
}

export function getTagValueDisplayNameForDimension(tagValue: TagValue): string {
  return tagValue.dimensionDisplayName ?? tagValue.dimensionKey
}

export function getDimensionDisplayName(dimension: TagDimension): string {
  return dimension.displayName ?? dimension.key
}

export function getTagValueDisplayName(tag: { value: string, displayName?: string | null, archivedAt?: Date | null }): string {
  const valueBaseLabel = tag.displayName ?? tag.value
  const archiveAwareLabel = tag.archivedAt ? `${valueBaseLabel} (Archived)` : valueBaseLabel
  return archiveAwareLabel
}

export const makeTag = Schema.decodeSync(TagSchema)
export type Tag = typeof TagSchema.Type

export const TransactionTagSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  dimensionDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('dimension_display_name')),
  valueDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('value_display_name')),

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

export const makeTagKeyValueFromTag = ({ key, value, dimensionDisplayName, valueDisplayName }: Tag) => makeTagKeyValue({
  key: key,
  value: value,
  dimension_display_name: dimensionDisplayName,
  value_display_name: valueDisplayName,
})

export const makeTagFromTransactionTag = ({ id, key, value, dimensionDisplayName, valueDisplayName, archivedAt, _local }: TransactionTag) => {
  return {
    id,
    key,
    value,
    dimensionDisplayName: dimensionDisplayName,
    valueDisplayName: valueDisplayName,
    archivedAt: archivedAt,
    _local: {
      isOptimistic: _local?.isOptimistic ?? false,
    },
  } as Tag
}
