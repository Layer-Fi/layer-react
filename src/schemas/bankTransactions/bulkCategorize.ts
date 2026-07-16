import { Schema } from 'effect'

import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'

export const CategorizeTransactionRequestSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: CategoryUpdateSchema,
})

export const BulkCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Array(CategorizeTransactionRequestSchema),
})

export type BulkCategorizeRequest = typeof BulkCategorizeRequestSchema.Type
export type BulkCategorizeRequestEncoded = typeof BulkCategorizeRequestSchema.Encoded
