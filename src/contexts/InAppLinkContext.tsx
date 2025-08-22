import { createContext, useContext, ReactNode } from 'react'

export enum EntityName {
  Unknown = 'Unknown',
  BankTransaction = 'Bank Transaction',
  Invoice = 'Invoice',
  InvoicePayment = 'Invoice Payment',
  Bill = 'Bill',
  BillPayment = 'Bill Payment',
  CustomerRefund = 'Customer Refund',
  CustomerRefundAllocation = 'Customer Refund Allocation',
  CustomerRefundPayment = 'Customer Refund Payment',
  VendorRefund = 'Vendor Refund',
  VendorRefundAllocation = 'Vendor Refund Allocation',
  VendorRefundPayment = 'Vendor Refund Payment',
  CustomerPayout = 'Customer Payout',
  VendorPayout = 'Vendor Payout',
  QuickBooks = 'QuickBooks',
  CustomJournalEntry = 'Custom Journal Entry',
  Payroll = 'Payroll',
  PayrollPayment = 'Payroll Payment',
  OpeningBalance = 'Opening Balance',
  InvoiceWriteOff = 'Invoice Write-Off',
  VendorCredit = 'Vendor Credit',
  CustomerCredit = 'Customer Credit',
}

export interface RelatedEntityLinkingMetadata {
  id: string
  entityName: EntityName
  externalId?: string
  referenceNumber?: string
  metadata?: unknown
}

export interface LinkingMetadata {
  id: string
  entityName: EntityName
  externalId?: string
  referenceNumber?: string
  metadata?: unknown
  relatedEntityLinkingMetadata?: RelatedEntityLinkingMetadata[]
}

export interface InAppLinkContextType {
  getInAppLink?: (source: LinkingMetadata) => ReactNode | undefined
}

export interface InAppLinkProviderProps {
  getInAppLink?: (source: LinkingMetadata) => ReactNode | undefined
  children: ReactNode
}

const InAppLinkContext = createContext<InAppLinkContextType>({})

export const useInAppLinkContext = () => useContext(InAppLinkContext)

export const InAppLinkProvider = ({
  getInAppLink,
  children,
}: InAppLinkProviderProps) => {
  return (
    <InAppLinkContext.Provider value={{ getInAppLink }}>
      {children}
    </InAppLinkContext.Provider>
  )
}
