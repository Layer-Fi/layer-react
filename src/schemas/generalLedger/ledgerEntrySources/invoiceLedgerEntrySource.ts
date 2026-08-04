import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const InvoiceLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Invoice_Ledger_Entry_Source'),
    invoiceId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('invoice_id'),
    ),
    invoiceNumber: pipe(
      Schema.propertySignature(Schema.NullOr(Schema.String)),
      Schema.fromKey('invoice_number'),
    ),
    recipientName: pipe(
      Schema.propertySignature(Schema.NullOr(Schema.String)),
      Schema.fromKey('recipient_name'),
    ),
    customerDescription: pipe(
      Schema.optional(Schema.String),
      Schema.fromKey('customer_description'),
    ),
    date: Schema.String,
    amount: Schema.Number,
  }),
)
