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
    // Backend UUID for this dimension
    dimensionId: Schema.UUID,
    // Machine-readable key
    dimensionKey: Schema.NonEmptyTrimmedString,
    // Display name for the dimension
    dimensionDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    // How it should be rendered on the UI, given all of its state
    dimensionLabel: Schema.NonEmptyTrimmedString,
    // Backend UUID for this value
    valueId: Schema.UUID,
    // Machine-readable value
    value: Schema.NonEmptyTrimmedString,
    // Display name for the value
    valueDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    // How it should be rendered on the UI, given all of its state
    valueLabel: Schema.NonEmptyTrimmedString,
    // Whether or not this value definition is archived
    isArchived: Schema.Boolean,
  }),
)
const internalMakeTagValue = Schema.decodeSync(TagValueSchema)

export function makeTagValue(tagValue: Omit<TagValue, 'dimensionLabel' | 'valueLabel'>) {
  const dimensionBaseLabel = tagValue.dimensionDisplayName ?? tagValue.dimensionKey

  const valueBaseLabel = tagValue.valueDisplayName ?? tagValue.value
  const archiveAwareLabel = tagValue.isArchived ? `${valueBaseLabel} (Archived)` : valueBaseLabel

  return internalMakeTagValue({
    ...tagValue,
    dimensionLabel: dimensionBaseLabel,
    valueLabel: archiveAwareLabel,
  })
}

export type TagValue = typeof TagValueSchema.Type

export const TagSchema = Schema.Data(
  Schema.Struct({
    // transaction_tags ID, which refers to an ApiTag in the backend, but retrieved
    // through a bank transaction.
    id: Schema.UUID,
    // Machine-readable key for the dimension
    key: Schema.NonEmptyTrimmedString,
    // Human-readable key for the dimension
    dimensionDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    dimensionLabel: Schema.NullishOr(Schema.NonEmptyTrimmedString),

    // Machine-readable value
    value: Schema.NonEmptyTrimmedString,
    // Human-readable value
    valueDisplayName: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    // What needs to be displayed for this specific value, given its state
    valueLabel: Schema.NullishOr(Schema.NonEmptyTrimmedString),
    // Archive state of this tag value
    archivedAt: Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    _local: Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
  }),
)
export const internalMakeTag = Schema.decodeSync(TagSchema)
export type Tag = typeof TagSchema.Type

export function makeTag(tag: Omit<Tag, 'dimensionLabel' | 'valueLabel'>) {
  return internalMakeTag({
    ...tag,
    dimensionLabel: tag.dimensionDisplayName ?? tag.key,
    valueLabel: tag.valueDisplayName ?? tag.value,
    archivedAt: tag.archivedAt instanceof Date
      ? tag.archivedAt.toISOString()
      : tag.archivedAt ?? null,
  })
}

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

export const makeTagKeyValueFromTag = ({ key, value, dimensionLabel, valueLabel }: Tag) => makeTagKeyValue({
  key: key,
  value: value,
  dimension_display_name: dimensionLabel,
  value_display_name: valueLabel,
})

export const makeTagFromTransactionTag = ({ id, key, value, dimensionDisplayName, valueDisplayName, archivedAt, _local }: TransactionTag) => makeTag({
  id,
  key,
  value,
  dimensionDisplayName: dimensionDisplayName,
  valueDisplayName: valueDisplayName,
  archivedAt: archivedAt,
  _local: {
    isOptimistic: _local?.isOptimistic ?? false,
  },
})
