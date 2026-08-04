import { pipe, Schema } from 'effect'
export const VendorPayoutLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Payout_Ledger_Entry_Source'),
  vendorPayoutId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_payout_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
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
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
