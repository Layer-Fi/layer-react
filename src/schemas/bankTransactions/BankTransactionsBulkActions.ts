import { Schema } from 'effect/index'
import { ClassificationSchema } from '../categorization'
import { TagKeyValueSchema } from '../../features/tags/tagSchemas'

export const SingleCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
})

export const SplitCategoryEntrySchema = Schema.Struct({
  category: ClassificationSchema,
  amount: Schema.Number,
  tags: Schema.optional(Schema.Array(TagKeyValueSchema)),
  customerId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('customer_id')),
  vendorId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('vendor_id')),
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
