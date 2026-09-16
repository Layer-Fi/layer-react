import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { BankTransactionCounterpartySchema, MinimalBankTransactionSchema } from '@schemas/features/bankTransactions/base'
import { BankDirectionFilterSchema, BankTransactionTypeSchema } from '@schemas/features/categorization/categorizationRuleFilters'

export const CreateCategorizationRuleSchema = Schema.Struct({
  applyRetroactively: pipe(
    Schema.optional(Schema.Boolean),
    Schema.fromKey('apply_retroactively'),
  ),
  createdBySuggestionId: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('created_by_suggestion_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  name: Schema.optional(Schema.NullishOr(Schema.String)),
  category: Schema.optional(Schema.NullishOr(AccountIdentifierSchema)),
  suggestion1: pipe(
    Schema.optional(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_1'),
  ),
  suggestion2: pipe(
    Schema.optional(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_2'),
  ),
  suggestion3: pipe(
    Schema.optional(Schema.NullishOr(AccountIdentifierSchema)),
    Schema.fromKey('suggestion_3'),
  ),
  businessNameFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('business_name_filter'),
  ),
  clientNameFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('client_name_filter'),
  ),
  merchantTypeFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('merchant_type_filter'),
  ),
  transactionDescriptionFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('transaction_description_filter'),
  ),
  transactionTypeFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
    Schema.fromKey('transaction_type_filter'),
  ),
  bankDirectionFilter: pipe(
    Schema.optional(Schema.NullishOr(BankDirectionFilterSchema)),
    Schema.fromKey('bank_direction_filter'),
  ),
  amountMinFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('amount_min_filter'),
  ),
  amountMaxFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('amount_max_filter'),
  ),
  counterpartyFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('counterparty_filter'),
  ),
  bankTransactionTypeFilter: pipe(
    Schema.optional(Schema.NullishOr(BankTransactionTypeSchema)),
    Schema.fromKey('bank_transaction_type_filter'),
  ),
  mccFilter: pipe(
    Schema.optional(Schema.NullishOr(Schema.String)),
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

export const UpdateCategorizationRulesSuggestionSchema = Schema.Union(
  CreateCategorizationRuleForCounterpartySchema,
)

export type UpdateCategorizationRulesSuggestion = typeof UpdateCategorizationRulesSuggestionSchema.Type
