import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/base'

export const InvoicePaymentLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Invoice_Payment_Ledger_Entry_Source'),
    invoiceId: pipe(
      Schema.propertySignature(Schema.NullOr(Schema.String)),
      Schema.fromKey('invoice_id'),
    ),
    invoicePaymentId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('invoice_payment_id'),
    ),
    invoiceNumber: pipe(
      Schema.propertySignature(Schema.NullOr(Schema.String)),
      Schema.fromKey('invoice_number'),
    ),
    amount: Schema.Number,
    invoiceIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('invoice_identifiers'),
    ),
  }),
)
