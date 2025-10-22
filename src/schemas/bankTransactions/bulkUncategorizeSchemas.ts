import { Schema } from 'effect/index'

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

export const UncategorizeResultSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  success: Schema.Boolean,
})

export const BulkUncategorizeResponseDataSchema = Schema.Struct({
  results: Schema.Array(UncategorizeResultSchema),
})

export const BulkUncategorizeResponseSchema = Schema.Struct({
  data: BulkUncategorizeResponseDataSchema,
})
