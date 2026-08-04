import { pipe, Schema } from 'effect'

import { VendorSchema } from '@schemas/customerVendor/vendor'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const VendorCreditLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Credit_Ledger_Entry_Source'),
    vendorCreditId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('vendor_credit_id'),
    ),
    amount: Schema.Number,
    vendor: VendorSchema,
  }),
)
