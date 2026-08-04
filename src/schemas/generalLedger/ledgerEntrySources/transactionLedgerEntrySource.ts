import { pipe, Schema } from 'effect'

import { BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'
export const TransactionLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Transaction_Ledger_Entry_Source'),
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  direction: BankTransactionDirectionSchema,
  counterparty: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
