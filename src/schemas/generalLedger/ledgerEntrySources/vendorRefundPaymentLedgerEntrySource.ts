import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
export const VendorRefundPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Refund_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  refundPaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_payment_id'),
  ),
  refundedByVendorAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_by_vendor_amount'),
  ),
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
