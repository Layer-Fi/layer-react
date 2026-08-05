import { Schema } from 'effect'

import { BillLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/billLedgerEntrySource'
import { BillPaymentLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/billPaymentLedgerEntrySource'
import { ClosingActionLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/closingActionLedgerEntrySource'
import { CustomerCreditLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/customerCreditLedgerEntrySource'
import { CustomerRefundAllocationLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/customerRefundAllocationLedgerEntrySource'
import { CustomerRefundPaymentLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/customerRefundPaymentLedgerEntrySource'
import { InvoiceLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/invoiceLedgerEntrySource'
import { InvoicePaymentLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/invoicePaymentLedgerEntrySource'
import { InvoiceWriteOffLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/invoiceWriteOffLedgerEntrySource'
import { ManualLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/manualLedgerEntrySource'
import { OpeningBalanceLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/openingBalanceLedgerEntrySource'
import { PayoutLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/payoutLedgerEntrySource'
import { PayrollLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/payrollLedgerEntrySource'
import { PayrollPaymentLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/payrollPaymentLedgerEntrySource'
import { QuickBooksLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/quickBooksLedgerEntrySource'
import { TransactionLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/transactionLedgerEntrySource'
import { VendorCreditLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/vendorCreditLedgerEntrySource'
import { VendorPayoutLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/vendorPayoutLedgerEntrySource'
import { VendorRefundAllocationLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/vendorRefundAllocationLedgerEntrySource'
import { VendorRefundPaymentLedgerEntrySourceSchema } from '@schemas/features/generalLedger/ledgerEntrySources/vendorRefundPaymentLedgerEntrySource'

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
