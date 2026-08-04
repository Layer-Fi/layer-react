import { pipe, Schema } from 'effect'

import { BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const TransactionLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Transaction_Ledger_Entry_Source'),
    transactionId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('transaction_id'),
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
  }),
)
