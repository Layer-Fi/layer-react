import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const InvoiceWriteOffLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Invoice_Write_Off_Ledger_Entry_Source'),
    invoiceId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('invoice_id'),
    ),
    invoiceNumber: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('invoice_number'),
    ),
    recipientName: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('recipient_name'),
    ),
    customerDescription: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('customer_description'),
    ),
    date: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('write_off_date'),
    ),
    writeOffAmount: pipe(
      Schema.propertySignature(Schema.Number),
      Schema.fromKey('write_off_amount'),
    ),
    invoiceIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('invoice_identifiers'),
    ),
  }),
)
