import { pipe, Schema } from 'effect'

import { EntityName, type LinkingMetadata } from '@contexts/InAppLinkContext'

export const MatchAdjustmentSchema = Schema.Struct({
  amount: Schema.Number,
  account: Schema.Struct({
    id: Schema.String,
    type: Schema.optional(Schema.String),
  }),
  description: Schema.String,
})

export const FinancialEventIdentifiersSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})

const BaseMatchDetailsSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  date: Schema.String,
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
  TransferMatchDetailsSchema,
)

export const SuggestedMatchWithTransactionSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const SuggestedMatchesWithTransactionsSchema = Schema.Struct({
  matchPairs: pipe(
    Schema.propertySignature(Schema.Array(SuggestedMatchWithTransactionSchema)),
    Schema.fromKey('match_pairs'),
  ),
})

export const decodeMatchDetails = (data: unknown) => {
  const result = Schema.decodeUnknownEither(MatchDetailsSchema)(data)
  if (result._tag === 'Left') {
    console.warn('Failed to decode match details:', result.left)
    return null
  }
  return result.right
}

export const convertMatchDetailsToLinkingMetadata = (matchDetails: MatchDetailsType): LinkingMetadata => {
  const baseMetadata: LinkingMetadata = {
    id: matchDetails.id,
    entityName: EntityName.Unknown,
    externalId: matchDetails.externalId || undefined,
    referenceNumber: matchDetails.referenceNumber || undefined,
    metadata: matchDetails.metadata || undefined,
  }

  switch (matchDetails.type) {
    case 'Journal_Entry_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.CustomJournalEntry,
      }
    case 'Refund_Payment_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.CustomerRefundPayment,
        relatedEntityLinkingMetadata: matchDetails.customerRefundIdentifiers
          ? [{
            id: matchDetails.customerRefundIdentifiers.id,
            entityName: EntityName.CustomerRefund,
            externalId: matchDetails.customerRefundIdentifiers.externalId || undefined,
            referenceNumber: matchDetails.customerRefundIdentifiers.referenceNumber || undefined,
            metadata: matchDetails.customerRefundIdentifiers.metadata || undefined,
          }]
          : undefined,
      }
    case 'Vendor_Refund_Payment_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.VendorRefundPayment,
        relatedEntityLinkingMetadata: matchDetails.vendorRefundIdentifiers
          ? [{
            id: matchDetails.vendorRefundIdentifiers.id,
            entityName: EntityName.VendorRefundPayment,
            externalId: matchDetails.vendorRefundIdentifiers.externalId || undefined,
            referenceNumber: matchDetails.vendorRefundIdentifiers.referenceNumber || undefined,
            metadata: matchDetails.vendorRefundIdentifiers.metadata || undefined,
          }]
          : undefined,
      }
    case 'Invoice_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.InvoicePayment,
        relatedEntityLinkingMetadata: matchDetails.invoiceIdentifiers
          ? matchDetails.invoiceIdentifiers.map(identifier => ({
            id: identifier.id,
            entityName: EntityName.Invoice,
            externalId: identifier.externalId || undefined,
            referenceNumber: identifier.referenceNumber || undefined,
            metadata: identifier.metadata || undefined,
          }))
          : undefined,
      }
    case 'Payout_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.CustomerPayout,
      }
    case 'Vendor_Payout_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.VendorPayout,
      }
    case 'Bill_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.BillPayment,
        relatedEntityLinkingMetadata: matchDetails.billIdentifiers
          ? matchDetails.billIdentifiers.map(identifier => ({
            id: identifier.id,
            entityName: EntityName.Bill,
            externalId: identifier.externalId || undefined,
            referenceNumber: identifier.referenceNumber || undefined,
            metadata: identifier.metadata || undefined,
          }))
          : undefined,
      }
    case 'Payroll_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.PayrollPayment,
      }
    case 'Transfer_Match':
      return {
        ...baseMetadata,
        entityName: EntityName.BankTransaction,
      }
  }
}

export type MatchDetailsType = typeof MatchDetailsSchema.Type
export type MatchAdjustmentType = typeof MatchAdjustmentSchema.Type
export type FinancialEventIdentifiersType = typeof FinancialEventIdentifiersSchema.Type

export enum MatchType {
  TRANSFER = 'Transfer',
  INVOICE_PAYMENT = 'Invoice Payment',
  PAYOUT = 'Payout',
  VENDOR_PAYOUT = 'Vendor Payout',
  REFUND_PAYMENT = 'Refund Payment',
  VENDOR_REFUND_PAYMENT = 'Vendor Refund Payment',
  MANUAL_JOURNAL_ENTRY = 'Journal Entry',
  BILL_PAYMENT = 'Bill Payment',
  PAYROLL_PAYMENT = 'Payroll Payment',
}
export const MatchTypeSchema = Schema.Enums(MatchType)

export const SuggestedMatchSchema = Schema.Struct({
  id: Schema.String,
  // omitting matchType since it is currently serialized as camelCase and we don't actually need it anywhere
  details: MatchDetailsSchema,
})

export const MatchSchema = Schema.Struct({
  id: Schema.String,
  matchType: pipe(
    Schema.propertySignature(MatchTypeSchema),
    Schema.fromKey('match_type'),
  ),
  // Intentionally leaving out bank_transaction for now for simplicity. Add it later if necessary.
  details: MatchDetailsSchema,
})
