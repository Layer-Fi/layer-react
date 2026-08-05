import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/features/customerVendor/customer'
import { BaseLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/base'

export const CustomerCreditLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Customer_Credit_Ledger_Entry_Source'),
    customerCreditId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('customer_credit_id'),
    ),
    amount: Schema.Number,
    customer: CustomerSchema,
  }),
)
