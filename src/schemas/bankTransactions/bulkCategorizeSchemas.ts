import { Schema } from 'effect'
import { ClassificationSchema } from '../categorization'

export const CategoryCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
})

export const SplitEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: ClassificationSchema,
})

export const SplitCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Split'),
  entries: Schema.Array(SplitEntrySchema),
})

const BankTransactionCategorizationSchema = Schema.Union(
  CategoryCategorizationSchema,
  SplitCategorizationSchema,
)

export const TransactionCategorizationSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: BankTransactionCategorizationSchema,
})

export const BulkCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Array(TransactionCategorizationSchema),
})

export const CategorizationResultSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: Schema.NullOr(BankTransactionCategorizationSchema),
})

export const BulkCategorizeResponseDataSchema = Schema.Struct({
  results: Schema.Array(CategorizationResultSchema),
})

export const BulkCategorizeResponseSchema = Schema.Struct({
  data: BulkCategorizeResponseDataSchema,
})
