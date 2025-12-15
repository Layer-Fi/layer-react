import { pipe, Schema } from 'effect'

import { Direction } from '@internal-types/general'
import { CustomerSchema } from '@schemas/customer'
import { VendorSchema } from '@schemas/vendor'
import { EntityName, type LinkingMetadata } from '@contexts/InAppLinkContext'

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

export const TransactionLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Transaction_Ledger_Entry_Source'),
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  counterparty: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const InvoiceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Ledger_Entry_Source'),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('recipient_name'),
  ),
  customerDescription: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('customer_description'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const ManualLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Manual_Ledger_Entry_Source'),
  manualEntryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('manual_entry_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  memo: Schema.NullOr(Schema.String),
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const InvoicePaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  invoicePaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_payment_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  amount: Schema.Number,
  invoiceIdentifiers: pipe(
    Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
    Schema.fromKey('invoice_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const CustomerRefundAllocationLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Allocation_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  amount: Schema.Number,
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
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const CustomerRefundPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Payment_Ledger_Entry_Source'),
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
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const OpeningBalanceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_name'),
  ),
  openingBalanceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('opening_balance_id'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const PayoutLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Payout_Ledger_Entry_Source'),
  payoutId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('payout_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  paidOutAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('paid_out_amount'),
  ),
  processor: Schema.optional(Schema.NullOr(Schema.String)),
  completedAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('completed_at'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const QuickBooksLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Quickbooks_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  quickbooksId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('quickbooks_id'),
  ),
  importDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('import_date'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const InvoiceWriteOffLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Write_Off_Ledger_Entry_Source'),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  invoiceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  recipientName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('recipient_name'),
  ),
  customerDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('customer_description'),
  ),
  date: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('write_off_date'),
  ),
  writeOffAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('write_off_amount'),
  ),
  invoiceIdentifiers: pipe(
    Schema.propertySignature(FinancialEventIdentifiersSchema),
    Schema.fromKey('invoice_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

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

export const VendorPayoutLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Payout_Ledger_Entry_Source'),
  vendorPayoutId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_payout_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  paidOutAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('paid_out_amount'),
  ),
  processor: Schema.optional(Schema.NullOr(Schema.String)),
  completedAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('completed_at'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const PayrollLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Payroll_Ledger_Entry_Source'),
  payrollId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('payroll_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  payday: Schema.String,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const PayrollPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Payroll_Payment_Ledger_Entry_Source'),
  payrollId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('payroll_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const BillLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Bill_Ledger_Entry_Source'),
  billId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  billNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('bill_number'),
  ),
  vendorDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_description'),
  ),
  vendorExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const BillPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Bill_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  billPaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_payment_id'),
  ),
  billId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_id'),
  ),
  billNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('bill_number'),
  ),
  amount: Schema.Number,
  billIdentifiers: pipe(
    Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
    Schema.fromKey('bill_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const VendorCreditLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Vendor_Credit_Ledger_Entry_Source'),
  vendorCreditId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('vendor_credit_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  vendor: VendorSchema,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const CustomerCreditLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Customer_Credit_Ledger_Entry_Source'),
  customerCreditId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('customer_credit_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  customer: CustomerSchema,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const LedgerEntrySourceSchema = Schema.Union(
  TransactionLedgerEntrySourceSchema,
  InvoiceLedgerEntrySourceSchema,
  ManualLedgerEntrySourceSchema,
  InvoicePaymentLedgerEntrySourceSchema,
  CustomerRefundAllocationLedgerEntrySourceSchema,
  CustomerRefundPaymentLedgerEntrySourceSchema,
  OpeningBalanceLedgerEntrySourceSchema,
  PayoutLedgerEntrySourceSchema,
  QuickBooksLedgerEntrySourceSchema,
  InvoiceWriteOffLedgerEntrySourceSchema,
  VendorRefundAllocationLedgerEntrySourceSchema,
  VendorRefundPaymentLedgerEntrySourceSchema,
  VendorPayoutLedgerEntrySourceSchema,
  PayrollLedgerEntrySourceSchema,
  PayrollPaymentLedgerEntrySourceSchema,
  BillLedgerEntrySourceSchema,
  BillPaymentLedgerEntrySourceSchema,
  VendorCreditLedgerEntrySourceSchema,
  CustomerCreditLedgerEntrySourceSchema,
)

export const decodeLedgerEntrySource = (data: unknown) => {
  const result = Schema.decodeUnknownEither(LedgerEntrySourceSchema)(data)
  if (result._tag === 'Left') {
    console.warn('Failed to decode ledger entry source:', result.left)
    return null
  }
  return result.right
}

export const convertLedgerEntrySourceToLinkingMetadata = (ledgerEntrySource: LedgerEntrySourceType): LinkingMetadata => {
  const baseMetadata: LinkingMetadata = {
    id: '',
    entityName: EntityName.Unknown,
    externalId: ledgerEntrySource.externalId || undefined,
    referenceNumber: ledgerEntrySource.referenceNumber || undefined,
    metadata: ledgerEntrySource.metadata || undefined,
  }

  switch (ledgerEntrySource.type) {
    case 'Transaction_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.BankTransaction
      baseMetadata.id = ledgerEntrySource.transactionId
      break
    case 'Invoice_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.Invoice
      baseMetadata.id = ledgerEntrySource.invoiceId
      break
    case 'Manual_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.CustomJournalEntry
      baseMetadata.id = ledgerEntrySource.manualEntryId
      break
    case 'Invoice_Payment_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.invoicePaymentId
      baseMetadata.entityName = EntityName.InvoicePayment
      if (ledgerEntrySource.invoiceIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = ledgerEntrySource.invoiceIdentifiers.map(identifier => ({
          id: identifier.id,
          entityName: EntityName.Invoice,
          externalId: identifier.externalId || undefined,
          referenceNumber: identifier.referenceNumber || undefined,
          metadata: identifier.metadata || undefined,
        }))
      }
      break
    case 'Refund_Allocation_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.refundId
      baseMetadata.entityName = EntityName.CustomerRefundAllocation
      if (ledgerEntrySource.customerRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: ledgerEntrySource.customerRefundIdentifiers.id,
          entityName: EntityName.CustomerRefund,
          externalId: ledgerEntrySource.customerRefundIdentifiers.externalId || undefined,
          referenceNumber: ledgerEntrySource.customerRefundIdentifiers.referenceNumber || undefined,
          metadata: ledgerEntrySource.customerRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Refund_Payment_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.refundPaymentId
      baseMetadata.entityName = EntityName.CustomerRefundPayment
      if (ledgerEntrySource.customerRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: ledgerEntrySource.customerRefundIdentifiers.id,
          entityName: EntityName.CustomerRefund,
          externalId: ledgerEntrySource.customerRefundIdentifiers.externalId || undefined,
          referenceNumber: ledgerEntrySource.customerRefundIdentifiers.referenceNumber || undefined,
          metadata: ledgerEntrySource.customerRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Opening_Balance_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.OpeningBalance
      baseMetadata.id = ledgerEntrySource.openingBalanceId
      break
    case 'Payout_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.CustomerPayout
      baseMetadata.id = ledgerEntrySource.payoutId
      break
    case 'Quickbooks_Ledger_Entry_Source':
      baseMetadata.entityName = EntityName.QuickBooks
      baseMetadata.id = ledgerEntrySource.quickbooksId || ledgerEntrySource.externalId || ''
      break
    case 'Invoice_Write_Off_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.invoiceId
      baseMetadata.entityName = EntityName.InvoiceWriteOff
      if (ledgerEntrySource.invoiceIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: ledgerEntrySource.invoiceIdentifiers.id,
          entityName: EntityName.Invoice,
          externalId: ledgerEntrySource.invoiceIdentifiers.externalId || undefined,
          referenceNumber: ledgerEntrySource.invoiceIdentifiers.referenceNumber || undefined,
          metadata: ledgerEntrySource.invoiceIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Vendor_Refund_Allocation_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.refundId
      baseMetadata.entityName = EntityName.VendorRefundAllocation
      if (ledgerEntrySource.vendorRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: ledgerEntrySource.vendorRefundIdentifiers.id,
          entityName: EntityName.VendorRefund,
          externalId: ledgerEntrySource.vendorRefundIdentifiers.externalId || undefined,
          referenceNumber: ledgerEntrySource.vendorRefundIdentifiers.referenceNumber || undefined,
          metadata: ledgerEntrySource.vendorRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Vendor_Refund_Payment_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.refundPaymentId
      baseMetadata.entityName = EntityName.VendorRefundPayment
      if (ledgerEntrySource.vendorRefundIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = [{
          id: ledgerEntrySource.vendorRefundIdentifiers.id,
          entityName: EntityName.VendorRefund,
          externalId: ledgerEntrySource.vendorRefundIdentifiers.externalId || undefined,
          referenceNumber: ledgerEntrySource.vendorRefundIdentifiers.referenceNumber || undefined,
          metadata: ledgerEntrySource.vendorRefundIdentifiers.metadata || undefined,
        }]
      }
      break
    case 'Vendor_Payout_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.vendorPayoutId
      baseMetadata.entityName = EntityName.VendorPayout
      break
    case 'Payroll_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.payrollId
      baseMetadata.entityName = EntityName.Payroll
      break
    case 'Payroll_Payment_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.payrollId
      baseMetadata.entityName = EntityName.PayrollPayment
      break
    case 'Bill_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.billId
      baseMetadata.entityName = EntityName.Bill
      break
    case 'Bill_Payment_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.billPaymentId
      baseMetadata.entityName = EntityName.BillPayment
      if (ledgerEntrySource.billIdentifiers) {
        baseMetadata.relatedEntityLinkingMetadata = ledgerEntrySource.billIdentifiers.map(identifier => ({
          id: identifier.id,
          entityName: EntityName.Bill,
          externalId: identifier.externalId || undefined,
          referenceNumber: identifier.referenceNumber || undefined,
          metadata: identifier.metadata || undefined,
        }))
      }
      break
    case 'Vendor_Credit_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.vendorCreditId
      baseMetadata.entityName = EntityName.VendorCredit
      break
    case 'Customer_Credit_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.customerCreditId
      baseMetadata.entityName = EntityName.CustomerCredit
      break
  }

  return baseMetadata
}

export type LedgerEntrySourceType = typeof LedgerEntrySourceSchema.Type
