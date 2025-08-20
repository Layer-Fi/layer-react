import { Schema, pipe } from 'effect'
import { EntityName, LinkingMetadata } from '../contexts/InAppLinkContext'

export const ApiMatchAdjustmentSchema = Schema.Struct({
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
    Schema.optional(Schema.String),
    Schema.fromKey('external_id'),
  ),
  referenceNumber: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})

const BaseMatchDetailsSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  date: Schema.String,
  description: Schema.String,
  adjustment: Schema.optional(ApiMatchAdjustmentSchema),
  referenceNumber: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.Unknown),
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

export const decodeMatchDetails = Schema.decodeUnknownSync(MatchDetailsSchema)

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
      baseMetadata.entityName = EntityName.CustomJournalEntry
      break
    case 'Refund_Payment_Match':
      baseMetadata.entityName = EntityName.CustomerRefundPayment
      if (matchDetails.customerRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: matchDetails.customerRefundIdentifiers.id,
          entityName: EntityName.CustomerRefund,
          externalId: matchDetails.customerRefundIdentifiers.externalId || undefined,
          referenceNumber: matchDetails.customerRefundIdentifiers.referenceNumber || undefined,
          metadata: matchDetails.customerRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Vendor_Refund_Payment_Match':
      baseMetadata.entityName = EntityName.VendorRefundPayment
      if (matchDetails.vendorRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: matchDetails.vendorRefundIdentifiers.id,
          entityName: EntityName.VendorRefundPayment,
          externalId: matchDetails.vendorRefundIdentifiers.externalId || undefined,
          referenceNumber: matchDetails.vendorRefundIdentifiers.referenceNumber || undefined,
          metadata: matchDetails.vendorRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Invoice_Match':
      baseMetadata.entityName = EntityName.InvoicePayment
      if (matchDetails.invoiceIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = matchDetails.invoiceIdentifiers.map(identifier => ({
          id: identifier.id,
          entityName: EntityName.Invoice,
          externalId: identifier.externalId || undefined,
          referenceNumber: identifier.referenceNumber || undefined,
          metadata: identifier.metadata || undefined,
        }))
      }
      break
    case 'Payout_Match':
      baseMetadata.entityName = EntityName.CustomerPayout
      break
    case 'Vendor_Payout_Match':
      baseMetadata.entityName = EntityName.VendorPayout
      break
    case 'Bill_Match':
      baseMetadata.entityName = EntityName.BillPayment
      if (matchDetails.billIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = matchDetails.billIdentifiers.map(identifier => ({
          id: identifier.id,
          entityName: EntityName.Bill,
          externalId: identifier.externalId || undefined,
          referenceNumber: identifier.referenceNumber || undefined,
          metadata: identifier.metadata || undefined,
        }))
      }
      break
    case 'Payroll_Match':
      baseMetadata.entityName = EntityName.PayrollPayment
      break
    case 'Transfer_Match':
      baseMetadata.entityName = EntityName.BankTransaction
      break
  }

  return baseMetadata
}

export type MatchDetailsType = typeof MatchDetailsSchema.Type
export type ApiMatchAdjustmentType = typeof ApiMatchAdjustmentSchema.Type
export type FinancialEventIdentifiersType = typeof FinancialEventIdentifiersSchema.Type
