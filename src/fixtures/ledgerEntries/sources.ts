import { Schema } from 'effect'

import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { EntryType } from '@schemas/generalLedger/ledgerEntry'
import { LedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySource'

import { makeCustomer } from '@fixtures/customers/mocks'
import { makeVendor } from '@fixtures/vendors/mocks'

type LedgerEntrySource = typeof LedgerEntrySourceSchema.Type

const encodeSource = Schema.encodeSync(LedgerEntrySourceSchema)

export const makeManualEntrySource = ({ id, memo }: { id: string, memo: string | null }) =>
  encodeSource({
    type: 'Manual_Ledger_Entry_Source',
    displayDescription: memo ?? 'Manual journal entry',
    entityName: 'Manual journal entry',
    manualEntryId: id,
    memo,
    createdBy: 'Layer',
  })

type ExampleSource = {
  entryType: EntryType
  source: typeof LedgerEntrySourceSchema.Encoded
}

const makeSource = (entryType: EntryType, source: LedgerEntrySource): ExampleSource =>
  ({ entryType, source: encodeSource(source) })

export const ledgerEntrySourceExamples: readonly ExampleSource[] = [
  makeSource(EntryType.Expense, {
    type: 'Transaction_Ledger_Entry_Source',
    displayDescription: 'Office supplies at Staples',
    entityName: 'Bank transaction',
    transactionId: '00000000-0000-4000-8000-000000001001',
    externalId: null,
    accountName: 'Business Checking',
    date: '2025-03-12',
    amount: 8250,
    direction: BankTransactionDirection.Debit,
    counterparty: 'Staples',
    description: 'Office supplies',
  }),
  makeSource(EntryType.Invoice, {
    type: 'Invoice_Ledger_Entry_Source',
    displayDescription: 'Invoice #1042 to Acme Corp',
    entityName: 'Invoice',
    invoiceId: '00000000-0000-4000-8000-000000001002',
    externalId: null,
    invoiceNumber: '1042',
    recipientName: 'Acme Corp',
    date: '2025-02-01',
    amount: 250000,
  }),
  makeSource(EntryType.InvoicePayment, {
    type: 'Invoice_Payment_Ledger_Entry_Source',
    displayDescription: 'Payment for invoice #1042',
    entityName: 'Invoice payment',
    externalId: null,
    invoiceId: '00000000-0000-4000-8000-000000001002',
    invoicePaymentId: '00000000-0000-4000-8000-000000001003',
    invoiceNumber: '1042',
    amount: 250000,
    invoiceIdentifiers: [{ id: '00000000-0000-4000-8000-000000001002' }],
  }),
  makeSource(EntryType.RefundAllocation, {
    type: 'Refund_Allocation_Ledger_Entry_Source',
    displayDescription: 'Refund allocation for Acme Corp',
    entityName: 'Customer refund allocation',
    refundId: '00000000-0000-4000-8000-000000001004',
    amount: 12500,
    recipientName: 'Acme Corp',
    customerDescription: 'Acme Corp',
    customerRefundIdentifiers: { id: '00000000-0000-4000-8000-000000001004' },
  }),
  makeSource(EntryType.RefundPayment, {
    type: 'Refund_Payment_Ledger_Entry_Source',
    displayDescription: 'Refund paid to Acme Corp',
    entityName: 'Customer refund payment',
    refundId: '00000000-0000-4000-8000-000000001004',
    refundPaymentId: '00000000-0000-4000-8000-000000001005',
    refundedToCustomerAmount: 12500,
    recipientName: 'Acme Corp',
    customerDescription: 'Acme Corp',
    customerRefundIdentifiers: { id: '00000000-0000-4000-8000-000000001004' },
  }),
  makeSource(EntryType.OpeningBalance, {
    type: 'Opening_Balance_Ledger_Entry_Source',
    displayDescription: 'Opening balance for Business Checking',
    entityName: 'Opening balance',
    accountName: 'Business Checking',
    openingBalanceId: '00000000-0000-4000-8000-000000001006',
  }),
  makeSource(EntryType.Payout, {
    type: 'Payout_Ledger_Entry_Source',
    displayDescription: 'Stripe payout',
    entityName: 'Payout',
    payoutId: '00000000-0000-4000-8000-000000001007',
    externalId: null,
    paidOutAmount: 187500,
    processor: 'STRIPE',
    completedAt: '2025-04-03T00:00:00Z',
  }),
  makeSource(EntryType.Quickbooks, {
    type: 'Quickbooks_Ledger_Entry_Source',
    displayDescription: 'Imported from QuickBooks',
    entityName: 'QuickBooks import',
    quickbooksId: 'qb-3391',
    importDate: '2025-01-15',
  }),
  makeSource(EntryType.InvoiceWriteOff, {
    type: 'Invoice_Write_Off_Ledger_Entry_Source',
    displayDescription: 'Write-off of invoice #0996',
    entityName: 'Invoice write-off',
    invoiceId: '00000000-0000-4000-8000-000000001008',
    invoiceNumber: '0996',
    recipientName: 'Acme Corp',
    customerDescription: 'Acme Corp',
    date: '2025-05-20',
    writeOffAmount: 45000,
    invoiceIdentifiers: { id: '00000000-0000-4000-8000-000000001008' },
  }),
  makeSource(EntryType.VendorRefundAllocation, {
    type: 'Vendor_Refund_Allocation_Ledger_Entry_Source',
    displayDescription: 'Vendor refund allocation from Stark Industries',
    entityName: 'Vendor refund allocation',
    refundId: '00000000-0000-4000-8000-000000001009',
    amount: 9900,
    vendorDescription: 'Stark Industries',
    vendorRefundIdentifiers: { id: '00000000-0000-4000-8000-000000001009' },
  }),
  makeSource(EntryType.VendorRefundPayment, {
    type: 'Vendor_Refund_Payment_Ledger_Entry_Source',
    displayDescription: 'Vendor refund received from Stark Industries',
    entityName: 'Vendor refund payment',
    refundId: '00000000-0000-4000-8000-000000001009',
    refundPaymentId: '00000000-0000-4000-8000-00000000100a',
    refundedByVendorAmount: 9900,
    vendorDescription: 'Stark Industries',
    vendorRefundIdentifiers: { id: '00000000-0000-4000-8000-000000001009' },
  }),
  makeSource(EntryType.VendorPayout, {
    type: 'Vendor_Payout_Ledger_Entry_Source',
    displayDescription: 'Vendor payout',
    entityName: 'Vendor payout',
    vendorPayoutId: '00000000-0000-4000-8000-00000000100b',
    paidOutAmount: 64000,
    processor: 'STRIPE',
    completedAt: '2025-06-10T00:00:00Z',
  }),
  makeSource(EntryType.Payroll, {
    type: 'Payroll_Ledger_Entry_Source',
    displayDescription: 'Payroll run for May 15',
    entityName: 'Payroll',
    payrollId: '00000000-0000-4000-8000-00000000100c',
    payday: '2025-05-15',
  }),
  makeSource(EntryType.PayrollPayment, {
    type: 'Payroll_Payment_Ledger_Entry_Source',
    displayDescription: 'Payroll payment for May 15',
    entityName: 'Payroll payment',
    payrollId: '00000000-0000-4000-8000-00000000100c',
    amount: 425000,
  }),
  makeSource(EntryType.Bill, {
    type: 'Bill_Ledger_Entry_Source',
    displayDescription: 'Bill #B-2207 from Stark Industries',
    entityName: 'Bill',
    billId: '00000000-0000-4000-8000-00000000100d',
    billNumber: 'B-2207',
    vendorDescription: 'Stark Industries',
    date: '2025-07-01',
    amount: 132000,
  }),
  makeSource(EntryType.BillPayment, {
    type: 'Bill_Payment_Ledger_Entry_Source',
    displayDescription: 'Payment for bill #B-2207',
    entityName: 'Bill payment',
    billPaymentId: '00000000-0000-4000-8000-00000000100e',
    billId: '00000000-0000-4000-8000-00000000100d',
    billNumber: 'B-2207',
    amount: 132000,
    billIdentifiers: [{ id: '00000000-0000-4000-8000-00000000100d' }],
  }),
  makeSource(EntryType.VendorCredit, {
    type: 'Vendor_Credit_Ledger_Entry_Source',
    displayDescription: 'Vendor credit from Stark Industries',
    entityName: 'Vendor credit',
    vendorCreditId: '00000000-0000-4000-8000-00000000100f',
    amount: 15000,
    vendor: makeVendor(),
  }),
  makeSource(EntryType.CustomerCredit, {
    type: 'Customer_Credit_Ledger_Entry_Source',
    displayDescription: 'Customer credit for Acme Corp',
    entityName: 'Customer credit',
    customerCreditId: '00000000-0000-4000-8000-000000001010',
    amount: 20000,
    customer: makeCustomer(),
  }),
]
