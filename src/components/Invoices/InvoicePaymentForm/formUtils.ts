import { type Invoice } from '../../../features/invoices/invoiceSchemas'
import { type DedicatedInvoicePaymentForm } from '../../../features/invoices/invoicePaymentSchemas'
import { BigDecimal as BD } from 'effect'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '../../../utils/bigDecimalUtils'
import { formatDate, startOfToday } from 'date-fns'
import { getLocalTimeZone, fromDate, toCalendarDate, today } from '@internationalized/date'
import { DATE_FORMAT_SHORT } from '../../../config/general'

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

export const validateInvoicePaymentForm = ({ invoicePayment, invoice }: { invoicePayment: DedicatedInvoicePaymentForm, invoice: Invoice }) => {
  const { amount, paidAt, method } = invoicePayment

  const errors = []
  if (!BD.isPositive(amount)) {
    errors.push({ amount: 'Payment amount must be greater than zero.' })
  }

  if (BD.greaterThan(amount, convertCentsToBigDecimal(invoice.outstandingBalance))) {
    errors.push({ amount: 'Payment amount cannot be greater than the outstanding invoice balance.' })
  }

  if (paidAt === null) {
    errors.push({ paidAt: 'Payment date is a required field.' })
  }

  if (paidAt && invoice.sentAt && toCalendarDate(paidAt).compare(toCalendarDate(fromDate(invoice.sentAt, 'UTC'))) < 0) {
    errors.push({ paidAt: `Payment date cannot be before the invoice date (${formatDate(invoice.sentAt, DATE_FORMAT_SHORT)}).` })
  }

  if (paidAt && toCalendarDate(paidAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ paidAt: 'Payment date cannot be in the future.' })
  }

  if (method === null) {
    errors.push({ method: 'Payment method is a required field.' })
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
