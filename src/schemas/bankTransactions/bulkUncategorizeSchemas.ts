import { Schema } from 'effect/index'
import { BankTransactionSchema } from './bankTransaction'

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

export const BulkUncategorizeResponseDataSchema = Schema.Array(BankTransactionSchema)

export const BulkUncategorizeResponseSchema = Schema.Struct({
  data: BulkUncategorizeResponseDataSchema,
})
