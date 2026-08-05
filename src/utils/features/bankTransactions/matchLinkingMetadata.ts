import { EntityName, type LinkingMetadata } from '@internal-types/inAppLink'
import type { MatchDetailsType } from '@schemas/features/bankTransactions/matchDetails'

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
