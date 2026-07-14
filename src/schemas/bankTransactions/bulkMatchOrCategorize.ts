import { pipe, Schema } from 'effect'

import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'

export const MatchTransactionRequestSchema = Schema.Struct({
  type: Schema.Literal('match'),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const CategorizeTransactionRequestSchema = Schema.Struct({
  type: Schema.Literal('categorize'),
  categorization: CategoryUpdateSchema,
})

export const MatchOrCategorizeTransactionRequestSchema = Schema.Union(
  MatchTransactionRequestSchema,
  CategorizeTransactionRequestSchema,
)

export const BulkMatchOrCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Record({
    key: Schema.UUID,
    value: MatchOrCategorizeTransactionRequestSchema,
  }),
})

export type BulkMatchOrCategorizeRequest = typeof BulkMatchOrCategorizeRequestSchema.Type
export type BulkMatchOrCategorizeRequestEncoded = typeof BulkMatchOrCategorizeRequestSchema.Encoded
