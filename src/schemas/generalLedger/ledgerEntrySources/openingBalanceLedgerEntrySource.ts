import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const OpeningBalanceLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
    accountName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('account_name'),
    ),
    openingBalanceId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('opening_balance_id'),
    ),
  }),
)
