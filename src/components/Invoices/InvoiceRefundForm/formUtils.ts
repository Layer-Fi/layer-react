import { fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { formatDate, startOfToday } from 'date-fns'
import type { TFunction } from 'i18next'

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

export const validateInvoiceRefundForm = (
  { invoiceRefund, invoice }: { invoiceRefund: InvoiceRefundForm, invoice: Invoice },
  t: TFunction,
) => {
  const { completedAt, method } = invoiceRefund

  const errors = []
  if (completedAt === null) {
    errors.push({ completedAt: t('invoices.refundDateIsARequiredField', 'Refund date is a required field.') })
  }

  if (completedAt && invoice.paidAt && toCalendarDate(completedAt).compare(toCalendarDate(fromDate(invoice.paidAt, 'UTC'))) < 0) {
    errors.push({
      completedAt: t('invoices.refundDateCannotBeBeforeLastInvoicePaymentDate', 'Refund date cannot be before the last invoice payment ({{lastPaymentDate}}).', {
        lastPaymentDate: formatDate(invoice.paidAt, DATE_FORMAT_SHORT),
      }),
    })
  }

  if (completedAt && toCalendarDate(completedAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ completedAt: t('invoices.refundDateCannotBeInTheFuture', 'Refund date cannot be in the future.') })
  }

  if (method === null) {
    errors.push({ method: t('invoices.paymentMethodIsARequiredField', 'Payment method is a required field.') })
  }

  return errors.length > 0 ? errors : null
}

export const convertInvoiceRefundFormToParams = (form: InvoiceRefundForm): unknown => ({
  amount: convertBigDecimalToCents(form.amount),
  method: form.method,
  completedAt: form.completedAt?.toDate(),
})
