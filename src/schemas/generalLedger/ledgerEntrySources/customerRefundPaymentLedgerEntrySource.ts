import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const CustomerRefundPaymentLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Refund_Payment_Ledger_Entry_Source'),
    refundId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('refund_id'),
    ),
    refundPaymentId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('refund_payment_id'),
    ),
    refundedToCustomerAmount: pipe(
      Schema.propertySignature(Schema.Number),
      Schema.fromKey('refunded_to_customer_amount'),
    ),
    recipientName: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('recipient_name'),
    ),
    customerDescription: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('customer_description'),
    ),
    customerRefundIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('customer_refund_identifiers'),
    ),
  }),
)
