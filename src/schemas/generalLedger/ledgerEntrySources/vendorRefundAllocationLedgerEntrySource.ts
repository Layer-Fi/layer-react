import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const VendorRefundAllocationLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Refund_Allocation_Ledger_Entry_Source'),
    refundId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('refund_id'),
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
  }),
)
