import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { BankTransactionCounterpartySchema } from '@schemas/features/bankTransactions/base'
import { BankDirectionFilterSchema } from '@schemas/features/categorization/categorizationRuleFilters'

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
  readableTransactionDescriptionFilter: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('readable_transaction_description_filter'),
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
