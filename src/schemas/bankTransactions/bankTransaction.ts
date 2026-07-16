import { pipe, Schema } from 'effect/index'

import { BankTransactionDirectionSchema, TransactionSourceSchema } from '@schemas/bankTransactions/base'
import { UpdateCategorizationRulesSuggestionSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { MatchSchema, SuggestedMatchSchema } from '@schemas/bankTransactions/match'
import { CategorizationSchema } from '@schemas/categorization'
import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'
import { CustomerSchema } from '@schemas/customer'
import { TransactionTagSchema } from '@schemas/tag'
import { createTransformedEnumSchema } from '@schemas/utils'
import { VendorSchema } from '@schemas/vendor'

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  MATCHED = 'MATCHED',
  UNKNOWN = 'UNKNOWN',
}

export enum InputStrategy {
  Auto = 'AUTO',
  AskFromSuggestions = 'ASK_FROM_SUGGESTIONS',
  LayerReview = 'LAYER_REVIEW',
  Unknown = 'UNKNOWN',
}

export const BankTransactionTaxOptionSchema = Schema.Struct({
  code: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})
export type BankTransactionTaxOption = typeof BankTransactionTaxOptionSchema.Type

export const BankTransactionTaxOptionsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Array(BankTransactionTaxOptionSchema),
})

export const InputStrategySchema = Schema.Enums(InputStrategy)
export const TransformedInputStrategySchema = createTransformedEnumSchema(
  InputStrategySchema,
  InputStrategy,
  InputStrategy.Unknown,
)

export const CategorizationStatusSchema = Schema.Enums(CategorizationStatus)
export const TransformedCategorizationStatusSchema = createTransformedEnumSchema(
  CategorizationStatusSchema,
  CategorizationStatus,
  CategorizationStatus.UNKNOWN,
)

export const CategorizationFlowSchema = Schema.Struct({
  type: TransformedInputStrategySchema,
  category: Schema.NullishOr(CategorizationSchema),
  suggestions: Schema.Array(CategorizationSchema),
})

export const BankTransactionSchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  source: TransactionSourceSchema,
  sourceTransactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('source_transaction_id'),
  ),
  sourceAccountId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('source_account_id'),
  ),
  date: Schema.Date,
  direction: BankTransactionDirectionSchema,
  amount: Schema.Number,
  counterpartyName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('counterparty_name'),
  ),
  description: Schema.NullishOr(Schema.String),
  accountName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('account_name'),
  ),
  accountMask: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('account_mask'),
  ),
  accountInstitution: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountInstitutionSchema)),
    Schema.fromKey('account_institution'),
  ),
  categorizationStatus: pipe(
    Schema.propertySignature(TransformedCategorizationStatusSchema),
    Schema.fromKey('categorization_status'),
  ),
  category: Schema.NullishOr(CategorizationSchema),
  categorizationFlow: pipe(
    Schema.propertySignature(Schema.NullishOr(CategorizationFlowSchema)),
    Schema.fromKey('categorization_flow'),
  ),
  taxCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_code'),
  ),
  taxOptions: pipe(
    Schema.propertySignature(Schema.NullishOr(BankTransactionTaxOptionsSchema)),
    Schema.fromKey('tax_options'),
  ),
  suggestedMatches: pipe(
    Schema.propertySignature(Schema.Array(SuggestedMatchSchema)),
    Schema.fromKey('suggested_matches'),
  ),
  match: Schema.NullishOr(MatchSchema),
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
  documentIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('document_ids'),
  ),
  memo: Schema.NullishOr(Schema.String),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.NullishOr(Schema.Unknown),
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),

  updateCategorizationRulesSuggestion: pipe(
    Schema.propertySignature(Schema.NullishOr(UpdateCategorizationRulesSuggestionSchema)),
    Schema.fromKey('update_categorization_rules_suggestion'),
  ),
})
