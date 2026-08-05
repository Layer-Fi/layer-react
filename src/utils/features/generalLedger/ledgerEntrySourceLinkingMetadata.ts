import { EntityName, type LinkingMetadata } from '@internal-types/shared/inAppLink'
import type { LedgerEntrySourceType } from '@schemas/features/generalLedger/ledgerEntrySource'

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
    case 'Closing_Action_Ledger_Entry_Source':
      baseMetadata.id = ledgerEntrySource.closingActionId
      baseMetadata.entityName = EntityName.ClosingAction
      break
  }

  return baseMetadata
}
