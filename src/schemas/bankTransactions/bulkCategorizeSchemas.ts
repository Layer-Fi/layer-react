import { Schema } from 'effect'

export const AccountIdClassificationSchema = Schema.Struct({
  type: Schema.Literal('AccountId'),
  id: Schema.String,
})

export const StableNameClassificationSchema = Schema.Struct({
  type: Schema.Literal('StableName'),
  stableName: Schema.propertySignature(Schema.String).pipe(
    Schema.fromKey('stable_name'),
  ),
})

export const ExclusionClassificationSchema = Schema.Struct({
  type: Schema.Literal('Exclusion'),
  exclusionType: Schema.propertySignature(Schema.String).pipe(
    Schema.fromKey('exclusion_type'),
  ),
})

export const BankTransactionClassificationSchema = Schema.Union(
  AccountIdClassificationSchema,
  StableNameClassificationSchema,
  ExclusionClassificationSchema,
)

export const CategoryCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: BankTransactionClassificationSchema,
})

export const SplitEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: BankTransactionClassificationSchema,
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
