import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const PayoutLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Payout_Ledger_Entry_Source'),
    payoutId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('payout_id'),
    ),
    paidOutAmount: pipe(
      Schema.propertySignature(Schema.Number),
      Schema.fromKey('paid_out_amount'),
    ),
    processor: Schema.optional(Schema.NullOr(Schema.String)),
    completedAt: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('completed_at'),
    ),
  }),
)
