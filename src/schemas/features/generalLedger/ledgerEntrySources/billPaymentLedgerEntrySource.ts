import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/base'

export const BillPaymentLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Bill_Payment_Ledger_Entry_Source'),
    billPaymentId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('bill_payment_id'),
    ),
    billId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('bill_id'),
    ),
    billNumber: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('bill_number'),
    ),
    amount: Schema.Number,
    billIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('bill_identifiers'),
    ),
  }),
)
