import { fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { formatDate, startOfToday } from 'date-fns'
import i18next from 'i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'
import { DATE_FORMAT_SHORT } from '@utils/time/timeFormats'
import type { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas'

export const getInvoiceRefundFormDefaultValues = (invoice: Invoice): InvoiceRefundForm => {
  const completedAt = fromDate(startOfToday(), getLocalTimeZone())

  return {
    amount: convertCentsToBigDecimal(invoice.totalAmount),
    method: null,
    completedAt: completedAt,
  }
}

export const validateInvoiceRefundForm = ({ invoiceRefund, invoice }: { invoiceRefund: InvoiceRefundForm, invoice: Invoice }) => {
  const { completedAt, method } = invoiceRefund

  const errors = []
  if (completedAt === null) {
    errors.push({ completedAt: i18next.t('refundDateIsARequiredField', 'Refund date is a required field.') })
  }

  if (completedAt && invoice.paidAt && toCalendarDate(completedAt).compare(toCalendarDate(fromDate(invoice.paidAt, 'UTC'))) < 0) {
    errors.push({ completedAt: i18next.t('refundDateCannotBeBeforeTheLastInvoicePaymentVal', 'Refund date cannot be before the last invoice payment ({{val}}).', { val: formatDate(invoice.paidAt, DATE_FORMAT_SHORT) }) })
  }

  if (completedAt && toCalendarDate(completedAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ completedAt: i18next.t('refundDateCannotBeInTheFuture', 'Refund date cannot be in the future.') })
  }

  if (method === null) {
    errors.push({ method: i18next.t('paymentMethodIsARequiredField', 'Payment method is a required field.') })
  }

  return errors.length > 0 ? errors : null
}

export const convertInvoiceRefundFormToParams = (form: InvoiceRefundForm): unknown => ({
  amount: convertBigDecimalToCents(form.amount),
  method: form.method,
  completedAt: form.completedAt?.toDate(),
})
