import { Schema } from 'effect'

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

export type BulkUncategorizeRequest = typeof BulkUncategorizeRequestSchema.Type
export type BulkUncategorizeRequestEncoded = typeof BulkUncategorizeRequestSchema.Encoded
