import { Schema, pipe } from 'effect'
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

export const BulkActionSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('match'),
    suggestedMatchId: pipe(
      Schema.propertySignature(Schema.UUID),
      Schema.fromKey('suggested_match_id'),
    ),
  }),
  Schema.Struct({
    type: Schema.Literal('categorize'),
    categorization: CategoryUpdateSchema,
  }),
)
