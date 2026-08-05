import { pipe, Schema } from 'effect'

export const SuggestedMatchWithTransactionSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const SuggestedMatchesWithTransactionsSchema = Schema.Struct({
  matchPairs: pipe(
    Schema.propertySignature(Schema.Array(SuggestedMatchWithTransactionSchema)),
    Schema.fromKey('match_pairs'),
  ),
})
