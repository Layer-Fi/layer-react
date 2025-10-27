import { Schema } from 'effect/index'
import { ClassificationSchema } from '../categorization'

export const SingleCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
})

export const SplitCategoryEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: ClassificationSchema,
})

export const SplitCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Split'),
  entries: Schema.Array(SplitCategoryEntrySchema),
})

export const CategoryUpdateSchema = Schema.Union(
  SingleCategoryUpdateSchema,
  SplitCategoryUpdateSchema,
)

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})
