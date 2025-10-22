import { Schema, pipe } from 'effect'

export const AccountIdentifierPayloadSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('StableName'),
    stableName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('stable_name'),
    ),
  }),
  Schema.Struct({
    type: Schema.Literal('AccountId'),
    id: Schema.String,
  }),
  Schema.Struct({
    type: Schema.Literal('Exclusion'),
    exclusionType: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('exclusion_type'),
    ),
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

export const MatchedResultSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('transaction_id'),
  ),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const CategorizedResultSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('transaction_id'),
  ),
  categorization: Schema.NullOr(CategoryUpdateSchema),
})

export const BulkMatchOrCategorizeDataSchema = Schema.Struct({
  matchedResults: pipe(
    Schema.propertySignature(Schema.Array(MatchedResultSchema)),
    Schema.fromKey('matched_results'),
  ),
  categorizedResults: pipe(
    Schema.propertySignature(Schema.Array(CategorizedResultSchema)),
    Schema.fromKey('categorized_results'),
  ),
})
