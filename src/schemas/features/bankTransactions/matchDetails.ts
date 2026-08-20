import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'

export const MatchAdjustmentSchema = Schema.Struct({
  amount: Schema.Number,
  account: Schema.Struct({
    id: Schema.String,
    type: Schema.optional(Schema.String),
  }),
  description: Schema.String,
})

const BaseMatchDetailsSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  date: Schema.Date,
  description: Schema.String,
  adjustment: Schema.NullOr(MatchAdjustmentSchema),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})

export const ManualJournalEntryMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Journal_Entry_Match'),
  }),
)

export const RefundPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Refund_Payment_Match'),
    customerRefundIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('customer_refund_identifiers'),
    ),
  }),
)

export const VendorRefundPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Refund_Payment_Match'),
    vendorRefundIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('vendor_refund_identifiers'),
    ),
  }),
)

export const InvoicePaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Invoice_Match'),
    invoiceIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('invoice_identifiers'),
    ),
  }),
)

export const PayoutMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Payout_Match'),
  }),
)

export const VendorPayoutMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Payout_Match'),
  }),
)

export const BillPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Bill_Match'),
    billIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('bill_identifiers'),
    ),
  }),
)

export const PayrollPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Payroll_Match'),
  }),
)

export const LoanPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Loan_Payment_Match'),
    loanIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('loan_identifiers'),
    ),
  }),
)

export const LoanProceedMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Loan_Proceed_Match'),
    loanIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('loan_identifiers'),
    ),
  }),
)

export const TransferMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Transfer_Match'),
    fromAccountName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('from_account_name'),
    ),
    toAccountName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('to_account_name'),
    ),
  }),
)

export const MatchDetailsSchema = Schema.Union(
  ManualJournalEntryMatchDetailsSchema,
  RefundPaymentMatchDetailsSchema,
  VendorRefundPaymentMatchDetailsSchema,
  InvoicePaymentMatchDetailsSchema,
  PayoutMatchDetailsSchema,
  VendorPayoutMatchDetailsSchema,
  BillPaymentMatchDetailsSchema,
  PayrollPaymentMatchDetailsSchema,
  LoanPaymentMatchDetailsSchema,
  LoanProceedMatchDetailsSchema,
  TransferMatchDetailsSchema,
)

// Catch-all for match detail types the backend adds before this package knows about them.
// Kept out of `MatchDetailsSchema` so its `type` stays a literal union and still narrows.
export const UnknownMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.String,
  }),
)

export const MatchDetailsWithFallbackSchema = Schema.Union(
  MatchDetailsSchema,
  UnknownMatchDetailsSchema,
)

export const isKnownMatchDetails = Schema.is(MatchDetailsSchema)

export type MatchDetailsType = typeof MatchDetailsSchema.Type
export type UnknownMatchDetailsType = typeof UnknownMatchDetailsSchema.Type
export type MatchDetailsWithFallbackType = typeof MatchDetailsWithFallbackSchema.Type
export type MatchAdjustmentType = typeof MatchAdjustmentSchema.Type
