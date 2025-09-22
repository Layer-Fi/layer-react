import { pipe, Schema } from 'effect/index'
import { BankTransactionCounterpartySchema, MinimalBankTransactionSchema } from '../bankTransaction'
import { CategorizationSchema } from '../../categorization'

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
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('created_by_suggestion_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  category: Schema.optional(Schema.NullOr(CategorizationSchema)),
  suggestion1: pipe(
    Schema.optional(Schema.NullOr(CategorizationSchema)),
    Schema.fromKey('suggestion_1'),
  ),
  suggestion2: pipe(
    Schema.optional(Schema.NullOr(CategorizationSchema)),
    Schema.fromKey('suggestion_2'),
  ),
  suggestion3: pipe(
    Schema.optional(Schema.NullOr(CategorizationSchema)),
    Schema.fromKey('suggestion_3'),
  ),
  businessNameFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('business_name_filter'),
  ),
  clientNameFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('client_name_filter'),
  ),
  merchantTypeFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('merchant_type_filter'),
  ),
  transactionDescriptionFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('transaction_description_filter'),
  ),
  transactionTypeFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('transaction_type_filter'),
  ),
  bankDirectionFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('bank_direction_filter'),
  ),
  amountMinFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.Number)),
    Schema.fromKey('amount_min_filter'),
  ),
  amountMaxFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.Number)),
    Schema.fromKey('amount_max_filter'),
  ),
  counterpartyFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('counterparty_filter'),
  ),
  bankTransactionTypeFilter: pipe(
    Schema.optional(Schema.NullOr(BankTransactionTypeSchema)),
    Schema.fromKey('bank_transaction_type_filter'),
  ),
  mccFilter: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('mcc_filter'),
  ),
})

export const CreateCategorizationRuleForCounterpartySchema = Schema.Struct({
  newRule: pipe(
    Schema.propertySignature(CreateCategorizationRuleSchema),
    Schema.fromKey('new_rule'),
  ),
  counterparty: BankTransactionCounterpartySchema,
  suggestionPrompt: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('suggestion_prompt'),
  ),
  transactionsThatWillBeAffected: Schema.Array(MinimalBankTransactionSchema),
})
export const UpdateCategorizationRulesSuggestionSchema = Schema.Union(
  CreateCategorizationRuleForCounterpartySchema,
)
