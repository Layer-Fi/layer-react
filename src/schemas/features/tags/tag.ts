import { Schema } from 'effect'

import type { TransactionTag } from '@schemas/features/tags/transactionTag'

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

export const makeTag = Schema.decodeSync(TagSchema)
export type Tag = typeof TagSchema.Type

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
