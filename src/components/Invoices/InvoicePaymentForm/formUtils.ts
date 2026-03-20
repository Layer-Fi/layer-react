import { fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { startOfToday } from 'date-fns'
import { BigDecimal as BD } from 'effect'

import { type Invoice } from '@schemas/invoices/invoice'
import { type DedicatedInvoicePaymentForm } from '@schemas/invoices/invoicePayment'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'

export const getInvoicePaymentFormDefaultValues = (invoice: Invoice): DedicatedInvoicePaymentForm => {
  const paidAt = fromDate(startOfToday(), getLocalTimeZone())

  return {
    amount: convertCentsToBigDecimal(invoice.outstandingBalance),
    method: null,
    paidAt,
    referenceNumber: '',
    memo: '',
  }
}

export enum InvoicePaymentInvalidReason {
  AmountMustBePositive = 'amountMustBePositive',
  AmountExceedsOutstandingBalance = 'amountExceedsOutstandingBalance',
  PaidAtRequired = 'paidAtRequired',
  PaidAtBeforeInvoiceDate = 'paidAtBeforeInvoiceDate',
  PaidAtInFuture = 'paidAtInFuture',
  MethodRequired = 'methodRequired',
}

export type InvoicePaymentValidationError = {
  field: 'amount' | 'paidAt' | 'method'
  reason: InvoicePaymentInvalidReason
}

export const validateInvoicePaymentForm = (
  { invoicePayment, invoice }: { invoicePayment: DedicatedInvoicePaymentForm, invoice: Invoice },
) => {
  const { amount, paidAt, method } = invoicePayment
  const errors: InvoicePaymentValidationError[] = []
  if (!BD.isPositive(amount)) {
    errors.push({ field: 'amount', reason: InvoicePaymentInvalidReason.AmountMustBePositive })
  }

  if (BD.greaterThan(amount, convertCentsToBigDecimal(invoice.outstandingBalance))) {
    errors.push({ field: 'amount', reason: InvoicePaymentInvalidReason.AmountExceedsOutstandingBalance })
  }

  if (paidAt === null) {
    errors.push({ field: 'paidAt', reason: InvoicePaymentInvalidReason.PaidAtRequired })
  }

  if (paidAt && invoice.sentAt && toCalendarDate(paidAt).compare(toCalendarDate(fromDate(invoice.sentAt, 'UTC'))) < 0) {
    errors.push({ field: 'paidAt', reason: InvoicePaymentInvalidReason.PaidAtBeforeInvoiceDate })
  }

  if (paidAt && toCalendarDate(paidAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ field: 'paidAt', reason: InvoicePaymentInvalidReason.PaidAtInFuture })
  }

  if (method === null) {
    errors.push({ field: 'method', reason: InvoicePaymentInvalidReason.MethodRequired })
  }

  return errors.length > 0 ? errors : null
}

export const convertInvoicePaymentFormToParams = (form: DedicatedInvoicePaymentForm): unknown => ({
  amount: convertBigDecimalToCents(form.amount),
  method: form.method,
  paidAt: form.paidAt?.toDate(),
  referenceNumber: form.referenceNumber.trim() || undefined,
  memo: form.memo.trim() || undefined,
})
