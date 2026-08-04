import { pipe, Schema } from 'effect'
export const BillLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Bill_Ledger_Entry_Source'),
  billId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
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
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
