import { Schema } from 'effect'

export const AccountIdentifierPayloadSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('StableName'),
    stable_name: Schema.String,
  }),
  Schema.Struct({
    type: Schema.Literal('AccountId'),
    id: Schema.String,
  }),
  Schema.Struct({
    type: Schema.Literal('Exclusion'),
    exclusion_type: Schema.String,
  }),
)

export const SingleCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: AccountIdentifierPayloadSchema,
})

export const SplitCategoryEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: AccountIdentifierPayloadSchema,
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
    suggested_match_id: Schema.String,
  }),
  Schema.Struct({
    type: Schema.Literal('categorize'),
    categorization: CategoryUpdateSchema,
  }),
)

export const MatchedResultSchema = Schema.Struct({
  transaction_id: Schema.String,
  suggested_match_id: Schema.String,
})

export const CategorizedResultSchema = Schema.Struct({
  transaction_id: Schema.String,
  categorization: Schema.NullOr(CategoryUpdateSchema),
})

export const BulkMatchOrCategorizeDataSchema = Schema.Struct({
  matched_results: Schema.Array(MatchedResultSchema),
  categorized_results: Schema.Array(CategorizedResultSchema),
})
