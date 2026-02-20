import { pipe, Schema } from 'effect/index'

import { AccountIdentifierSchema } from '@schemas/accountIdentifier'
import { BankTransactionCounterpartySchema, MinimalBankTransactionSchema } from '@schemas/bankTransactions/base'

export enum BankDirectionFilter {
  MONEY_IN = 'MONEY_IN',
  MONEY_OUT = 'MONEY_OUT',
}

export const BankDirectionFilterSchema = Schema.Enums(BankDirectionFilter)

export enum BankTransactionType {
  REVENUE = 'REVENUE',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  REFUND_RECEIVED = 'REFUND_RECEIVED',
  INCOMING_P2P_TRANSFER = 'INCOMING_P2P_TRANSFER',
  INTRA_ACCOUNT_TRANSFER_IN = 'INTRA_ACCOUNT_TRANSFER_IN',
  CHECK_WITHDRAWAL = 'CHECK_WITHDRAWAL',
  ATM_DEPOSIT = 'ATM_DEPOSIT',
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  BANK_VERIFICATION_TRIAL_CREDIT = 'BANK_VERIFICATION_TRIAL_CREDIT',
  REVERSAL_IN = 'REVERSAL_IN',
  CREDIT_CARD_REWARD = 'CREDIT_CARD_REWARD',
  INTEREST_EARNED = 'INTEREST_EARNED',
  GOVERNMENT_OR_OTHER_GRANT = 'GOVERNMENT_OR_OTHER_GRANT',
  TAX_REFUND = 'TAX_REFUND',
  PURCHASE = 'PURCHASE',
  REFUND_GIVEN = 'REFUND_GIVEN',
  OUTGOING_P2P_TRANSFER = 'OUTGOING_P2P_TRANSFER',
  INTRA_ACCOUNT_TRANSFER_OUT = 'INTRA_ACCOUNT_TRANSFER_OUT',
  CHECK_DEPOSIT = 'CHECK_DEPOSIT',
  ATM_WITHDRAWAL = 'ATM_WITHDRAWAL',
  BANK_WITHDRAWAL = 'BANK_WITHDRAWAL',
  BANKING_FEE = 'BANKING_FEE',
  PAYMENT_PROCESSING_FEE = 'PAYMENT_PROCESSING_FEE',
  BANK_VERIFICATION_TRIAL_DEBIT = 'BANK_VERIFICATION_TRIAL_DEBIT',
  REVERSAL_OUT = 'REVERSAL_OUT',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  TAX_PAYMENT = 'TAX_PAYMENT',
  NOT_ENOUGH_INFORMATION = 'NOT_ENOUGH_INFORMATION',
}

export const BankTransactionTypeSchema = Schema.Enums(BankTransactionType)

export const CreateCategorizationRuleSchema = Schema.Struct({
  applyRetroactively: pipe(
    Schema.optional(Schema.Boolean),
    Schema.fromKey('apply_retroactively'),
  ),
  createdBySuggestionId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('created_by_suggestion_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  name: Schema.NullishOr(Schema.String),
  category: Schema.NullishOr(AccountIdentifierSchema),
  suggestion1: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_1'),
  ),
  suggestion2: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_2'),
  ),
  suggestion3: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_3'),
  ),
  businessNameFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('business_name_filter'),
  ),
  clientNameFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('client_name_filter'),
  ),
  merchantTypeFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('merchant_type_filter'),
  ),
  transactionDescriptionFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('transaction_description_filter'),
  ),
  transactionTypeFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('transaction_type_filter'),
  ),
  bankDirectionFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(BankDirectionFilterSchema)),
    Schema.fromKey('bank_direction_filter'),
  ),
  amountMinFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('amount_min_filter'),
  ),
  amountMaxFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('amount_max_filter'),
  ),
  counterpartyFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('counterparty_filter'),
  ),
  bankTransactionTypeFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(BankTransactionTypeSchema)),
    Schema.fromKey('bank_transaction_type_filter'),
  ),
  mccFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('mcc_filter'),
  ),
})

export const CreateCategorizationRuleForCounterpartySchema = Schema.Struct({
  type: Schema.Literal('Create_Categorization_Rule_For_Counterparty'),
  newRule: pipe(
    Schema.propertySignature(CreateCategorizationRuleSchema),
    Schema.fromKey('new_rule'),
  ),
  counterparty: BankTransactionCounterpartySchema,
  suggestionPrompt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('suggestion_prompt'),
  ),
  transactionsThatWillBeAffected: pipe(
    Schema.propertySignature(Schema.Array(MinimalBankTransactionSchema)),
    Schema.fromKey('transactions_that_will_be_affected'),
  ),
})

export type CreateCategorizationRule = typeof CreateCategorizationRuleSchema.Type

export const CategorizationRuleSchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  name: Schema.NullishOr(Schema.String),
  category: Schema.NullishOr(AccountIdentifierSchema),
  suggestion1: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_1'),
  ),
  suggestion2: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_2'),
  ),
  suggestion3: pipe(
    Schema.propertySignature(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_3'),
  ),
  counterpartyFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(BankTransactionCounterpartySchema)),
    Schema.fromKey('counterparty_filter'),
  ),
  bankDirectionFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(BankDirectionFilterSchema)),
    Schema.fromKey('bank_direction_filter'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),
  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),
})

export type CategorizationRule = typeof CategorizationRuleSchema.Type

export const UpdateCategorizationRulesSuggestionSchema = Schema.Union(
  CreateCategorizationRuleForCounterpartySchema,
)

export type UpdateCategorizationRulesSuggestion = typeof UpdateCategorizationRulesSuggestionSchema.Type

export const decodeRulesSuggestion = (data: unknown): UpdateCategorizationRulesSuggestion | null => {
  const result = Schema.decodeUnknownEither(UpdateCategorizationRulesSuggestionSchema)(data)
  if (result._tag === 'Left') {
    console.warn('Failed to decode categorization rules update suggestion:', result.left)
    return null
  }
  return result.right
}
