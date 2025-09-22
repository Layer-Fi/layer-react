import { pipe, Schema } from 'effect/index'
import { CategorizationSchema } from '../categorization'
import { MatchSchema, SuggestedMatchSchema } from './match'
import { CustomerSchema } from '../customer'
import { VendorSchema } from '../vendor'
import { TransactionTagSchema } from '../../features/tags/tagSchemas'
import { UpdateCategorizationRulesSuggestionSchema } from './categorizationRules/categorizationRule'

export enum BankTransactionDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}
export const BankTransactionDirectionSchema = Schema.Enums(BankTransactionDirection)

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  MATCHED = 'MATCHED',
}

export enum InputStrategy {
  Auto = 'AUTO',
  AskFromSuggestions = 'ASK_FROM_SUGGESTIONS',
  LayerReview = 'LAYER_REVIEW',
}

export const InputStrategySchema = Schema.Enums(InputStrategy)

export const CategorizationFlowSchema = Schema.Struct({
  type: InputStrategySchema,
  category: Schema.optional(Schema.NullOr(CategorizationSchema)),
  suggestions: Schema.Array(CategorizationSchema),
})

export const BankTransactionSchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  sourceTransactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('source_transaction_id'),
  ),
  sourceAccountId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('source_account_id'),
  ),
  date: Schema.Date,
  direction: BankTransactionDirectionSchema,
  amount: Schema.Number,
  counterpartyName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('counterparty_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  accountName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('account_name'),
  ),
  categorizationFlow: pipe(
    Schema.optional(Schema.NullOr(CategorizationFlowSchema)),
    Schema.fromKey('categorization_flow'),
  ),
  suggestedMatches: pipe(
    Schema.propertySignature(Schema.Array(SuggestedMatchSchema)),
    Schema.fromKey('suggested_matches'),
  ),
  match: Schema.optional(Schema.NullOr(MatchSchema)),
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
  documentIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('document_ids'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),

  updateCategorizationRulesSuggestion: pipe(
    Schema.optional(Schema.NullOr(UpdateCategorizationRulesSuggestionSchema)),
    Schema.fromKey('update_categorization_rules_suggestion'),
  ),
})

// Maps onto the same object as BankTransactionSchema but minimal fields (for avoiding recursion for suggested rule updates)
export const MinimalBankTransactionSchema = Schema.Struct({
  id: Schema.String,
  date: Schema.Date,
  direction: BankTransactionDirectionSchema,
  amount: Schema.Number,
  counterpartyName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('counterparty_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
})

export const BankTransactionCounterpartySchema = Schema.Struct({
  id: Schema.String,
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  website: Schema.optional(Schema.NullOr(Schema.String)),
  logo: Schema.optional(Schema.NullOr(Schema.String)),
  mccs: Schema.Array(Schema.String),
})
