import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
export const InvoiceWriteOffLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Write_Off_Ledger_Entry_Source'),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
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
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
