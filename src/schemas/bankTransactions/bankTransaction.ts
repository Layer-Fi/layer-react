import { pipe, Schema } from 'effect/index'
import { ClassificationSchema, CategorizationSchema } from '../categorization'
import { MatchSchema, SuggestedMatchSchema } from './match'
import { CustomerSchema } from '../customer'
import { VendorSchema } from '../vendor'
import { TransactionTagSchema } from '../../features/tags/tagSchemas'
import { UpdateCategorizationRulesSuggestionSchema } from './categorizationRules/categorizationRule'
import { BankTransactionDirectionSchema } from './base'

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  MATCHED = 'MATCHED',
}

export const CategorizationStatusSchema = Schema.Enums(CategorizationStatus)

export enum ClassifierAgent {
  API = 'API',
  LAYER_MANUAL = 'LAYER_MANUAL',
  LAYER_AUTO = 'LAYER_AUTO',
  LAYER_RULE = 'LAYER_RULE',
}

export const ClassifierAgentSchema = Schema.Enums(ClassifierAgent)

export enum InputStrategy {
  Auto = 'AUTO',
  AskFromSuggestions = 'ASK_FROM_SUGGESTIONS',
  LayerReview = 'LAYER_REVIEW',
  DirectInput = 'DIRECT_INPUT',
}

export const InputStrategySchema = Schema.Enums(InputStrategy)

export const AccountInstitutionSchema = Schema.Struct({
  name: Schema.String,
  logo: Schema.NullOr(Schema.String),
})

export const CategorizationFlowSchema = Schema.Struct({
  type: InputStrategySchema,
  category: Schema.NullishOr(ClassificationSchema),
  suggestions: Schema.Array(ClassificationSchema),
})

export const BankTransactionSchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  source: Schema.optional(Schema.String),
  sourceTransactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('source_transaction_id'),
  ),
  sourceAccountId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('source_account_id'),
  ),
  importedAt: pipe(
    Schema.optional(Schema.Date),
    Schema.fromKey('imported_at'),
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
  accountMask: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('account_mask'),
  ),
  accountInstitution: pipe(
    Schema.optional(Schema.NullOr(AccountInstitutionSchema)),
    Schema.fromKey('account_institution'),
  ),
  categorizationStatus: pipe(
    Schema.optional(CategorizationStatusSchema),
    Schema.fromKey('categorization_status'),
  ),
  category: Schema.optional(Schema.NullOr(CategorizationSchema)),
  categorizationMethod: pipe(
    Schema.optional(Schema.NullOr(ClassifierAgentSchema)),
    Schema.fromKey('categorization_method'),
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
