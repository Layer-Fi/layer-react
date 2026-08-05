import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/base'

export const VendorRefundPaymentLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Refund_Payment_Ledger_Entry_Source'),
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
  }),
)
