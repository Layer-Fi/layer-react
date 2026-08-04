import { Schema } from 'effect'

import { BillLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/billLedgerEntrySource'
import { BillPaymentLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/billPaymentLedgerEntrySource'
import { ClosingActionLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/closingActionLedgerEntrySource'
import { CustomerCreditLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/customerCreditLedgerEntrySource'
import { CustomerRefundAllocationLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/customerRefundAllocationLedgerEntrySource'
import { CustomerRefundPaymentLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/customerRefundPaymentLedgerEntrySource'
import { InvoiceLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/invoiceLedgerEntrySource'
import { InvoicePaymentLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/invoicePaymentLedgerEntrySource'
import { InvoiceWriteOffLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/invoiceWriteOffLedgerEntrySource'
import { ManualLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/manualLedgerEntrySource'
import { OpeningBalanceLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/openingBalanceLedgerEntrySource'
import { PayoutLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/payoutLedgerEntrySource'
import { PayrollLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/payrollLedgerEntrySource'
import { PayrollPaymentLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/payrollPaymentLedgerEntrySource'
import { QuickBooksLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/quickBooksLedgerEntrySource'
import { TransactionLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/transactionLedgerEntrySource'
import { VendorCreditLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/vendorCreditLedgerEntrySource'
import { VendorPayoutLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/vendorPayoutLedgerEntrySource'
import { VendorRefundAllocationLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/vendorRefundAllocationLedgerEntrySource'
import { VendorRefundPaymentLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/vendorRefundPaymentLedgerEntrySource'

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
  ClosingActionLedgerEntrySourceSchema,
)

export const decodeLedgerEntrySource = (data: unknown) => {
  const result = Schema.decodeUnknownEither(LedgerEntrySourceSchema)(data)
  if (result._tag === 'Left') {
    console.warn('Failed to decode ledger entry source:', result.left)
    return null
  }
  return result.right
}

export type LedgerEntrySourceType = typeof LedgerEntrySourceSchema.Type
