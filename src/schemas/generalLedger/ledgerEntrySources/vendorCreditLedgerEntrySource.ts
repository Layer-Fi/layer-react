import { pipe, Schema } from 'effect'

import { VendorSchema } from '@schemas/customerVendor/vendor'
export const VendorCreditLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Credit_Ledger_Entry_Source'),
  vendorCreditId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_credit_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  vendor: VendorSchema,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
