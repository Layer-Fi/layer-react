import { Schema } from 'effect'

import type { Tag } from '@schemas/features/tags/tag'

export const TagKeyValueSchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  dimensionDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('dimension_display_name')),
  valueDisplayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('value_display_name'),
  ),
})
export const makeTagKeyValue = Schema.decodeSync(TagKeyValueSchema)

export const makeTagKeyValueFromTag = ({ key, value, dimensionDisplayName, valueDisplayName }: Tag) => makeTagKeyValue({
  key: key,
  value: value,
  dimension_display_name: dimensionDisplayName,
  value_display_name: valueDisplayName,
})
