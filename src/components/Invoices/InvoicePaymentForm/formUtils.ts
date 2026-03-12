import { fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { formatDate, startOfToday } from 'date-fns'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { type DedicatedInvoicePaymentForm } from '@schemas/invoices/invoicePayment'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'
import { DATE_FORMAT_SHORT } from '@utils/time/timeFormats'

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

export const validateInvoicePaymentForm = (
  { invoicePayment, invoice }: { invoicePayment: DedicatedInvoicePaymentForm, invoice: Invoice },
  t: TFunction,
) => {
  const { amount, paidAt, method } = invoicePayment

  const errors = []
  if (!BD.isPositive(amount)) {
    errors.push({ amount: t('paymentAmountMustBeGreaterThanZero', 'Payment amount must be greater than zero.') })
  }

  if (BD.greaterThan(amount, convertCentsToBigDecimal(invoice.outstandingBalance))) {
    errors.push({
      amount: t('paymentAmountCannotBeGreaterThanTheOutstandingInvoiceBalance', 'Payment amount cannot be greater than the outstanding invoice balance.'),
    })
  }

  if (paidAt === null) {
    errors.push({ paidAt: t('paymentDateIsARequiredField', 'Payment date is a required field.') })
  }

  if (paidAt && invoice.sentAt && toCalendarDate(paidAt).compare(toCalendarDate(fromDate(invoice.sentAt, 'UTC'))) < 0) {
    errors.push({
      paidAt: t('paymentDateCannotBeBeforeInvoiceDate', 'Payment date cannot be before the invoice date ({{invoiceDate}}).', {
        invoiceDate: formatDate(invoice.sentAt, DATE_FORMAT_SHORT),
      }),
    })
  }

  if (paidAt && toCalendarDate(paidAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ paidAt: t('paymentDateCannotBeInTheFuture', 'Payment date cannot be in the future.') })
  }

  if (method === null) {
    errors.push({ method: t('paymentMethodIsARequiredField', 'Payment method is a required field.') })
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
