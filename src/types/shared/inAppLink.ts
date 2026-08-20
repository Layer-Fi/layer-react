// The in-app-link contract, kept out of the provider so pure helpers can build
// linking metadata without depending on the context that renders it.

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
  LoanPayment = 'Loan Payment',
  LoanProceed = 'Loan Proceed',
  OpeningBalance = 'Opening Balance',
  InvoiceWriteOff = 'Invoice Write-Off',
  VendorCredit = 'Vendor Credit',
  CustomerCredit = 'Customer Credit',
  ClosingAction = 'Closing Action',
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
