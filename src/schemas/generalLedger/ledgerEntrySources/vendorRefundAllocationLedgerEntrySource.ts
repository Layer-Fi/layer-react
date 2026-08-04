import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
export const VendorRefundAllocationLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Refund_Allocation_Ledger_Entry_Source'),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  vendorExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  vendorDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_description'),
  ),
  vendorRefundIdentifiers: pipe(
    Schema.propertySignature(FinancialEventIdentifiersSchema),
    Schema.fromKey('vendor_refund_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
