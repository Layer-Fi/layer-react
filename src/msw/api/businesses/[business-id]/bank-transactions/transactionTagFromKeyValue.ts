import { type TagKeyValueSchema, type TransactionTag } from '@schemas/tag'

export const transactionTagFromKeyValue = (
  { key, value, dimensionDisplayName, valueDisplayName }: typeof TagKeyValueSchema.Type,
): TransactionTag => {
  const now = new Date()

  return {
    id: crypto.randomUUID(),
    key,
    value,
    dimensionDisplayName: dimensionDisplayName ?? null,
    valueDisplayName: valueDisplayName ?? null,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    deletedAt: null,
  }
}
