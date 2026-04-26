import { Schema } from 'effect/index'

import { ClassificationSchema } from '@schemas/categorization'
import { TagKeyValueSchema } from '@schemas/tag'

export const SingleCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
  taxCode: Schema.optional(Schema.NullOr(Schema.String)).pipe(Schema.fromKey('tax_code')),
})

export const SplitCategoryEntrySchema = Schema.Struct({
  category: ClassificationSchema,
  amount: Schema.Number,
  taxCode: Schema.optional(Schema.NullOr(Schema.String)).pipe(Schema.fromKey('tax_code')),
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

export type CategoryUpdate = typeof CategoryUpdateSchema.Type
export type CategoryUpdateEncoded = typeof CategoryUpdateSchema.Encoded

export function encodeCategoryUpdate(categoryUpdate: CategoryUpdate): CategoryUpdateEncoded {
  return Schema.encodeSync(CategoryUpdateSchema)(categoryUpdate)
}
