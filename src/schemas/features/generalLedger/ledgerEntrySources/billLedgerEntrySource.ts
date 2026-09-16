import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/base'

export const BillLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Bill_Ledger_Entry_Source'),
    billId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('bill_id'),
    ),
    billNumber: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('bill_number'),
    ),
    vendorDescription: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('vendor_description'),
    ),
    vendorExternalId: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('vendor_external_id'),
    ),
    date: Schema.String,
    amount: Schema.Number,
  }),
)
