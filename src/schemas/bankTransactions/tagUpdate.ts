import { pipe, Schema } from 'effect'

import { TagKeyValueSchema } from '@schemas/tag'

/** POST tags body - applies tag key/values to a set of transactions. */
export const TagBankTransactionsUpdateSchema = Schema.Struct({
  keyValues: pipe(
    Schema.propertySignature(Schema.Array(TagKeyValueSchema)),
    Schema.fromKey('key_values'),
  ),
  transactionIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('transaction_ids'),
  ),
})

export type TagBankTransactionsUpdate = typeof TagBankTransactionsUpdateSchema.Type
export type TagBankTransactionsUpdateEncoded = typeof TagBankTransactionsUpdateSchema.Encoded

/** DELETE tags body - removes tags from every transaction carrying them. */
export const RemoveBankTransactionTagsUpdateSchema = Schema.Struct({
  tagIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('tag_ids'),
  ),
})

export type RemoveBankTransactionTagsUpdate = typeof RemoveBankTransactionTagsUpdateSchema.Type
export type RemoveBankTransactionTagsUpdateEncoded = typeof RemoveBankTransactionTagsUpdateSchema.Encoded
