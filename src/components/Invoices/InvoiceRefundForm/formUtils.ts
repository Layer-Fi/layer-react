import { fromDate, getLocalTimeZone, toCalendarDate, today } from '@internationalized/date'
import { startOfToday } from 'date-fns'

import { type Invoice } from '@schemas/invoices/invoice'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'
import type { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas'

export const getInvoiceRefundFormDefaultValues = (invoice: Invoice): InvoiceRefundForm => {
  const completedAt = fromDate(startOfToday(), getLocalTimeZone())

  return {
    amount: convertCentsToBigDecimal(invoice.totalAmount),
    method: null,
    completedAt: completedAt,
  }
}

export enum InvoiceRefundInvalidReason {
  CompletedAtRequired = 'completedAtRequired',
  CompletedAtBeforeLastPayment = 'completedAtBeforeLastPayment',
  CompletedAtInFuture = 'completedAtInFuture',
  MethodRequired = 'methodRequired',
}

export type InvoiceRefundValidationError = {
  field: 'completedAt' | 'method'
  reason: InvoiceRefundInvalidReason
}

export const validateInvoiceRefundForm = (
  { invoiceRefund, invoice }: { invoiceRefund: InvoiceRefundForm, invoice: Invoice },
) => {
  const { completedAt, method } = invoiceRefund
  const errors: InvoiceRefundValidationError[] = []
  if (completedAt === null) {
    errors.push({ field: 'completedAt', reason: InvoiceRefundInvalidReason.CompletedAtRequired })
  }

  if (completedAt && invoice.paidAt && toCalendarDate(completedAt).compare(toCalendarDate(fromDate(invoice.paidAt, 'UTC'))) < 0) {
    errors.push({ field: 'completedAt', reason: InvoiceRefundInvalidReason.CompletedAtBeforeLastPayment })
  }

  if (completedAt && toCalendarDate(completedAt).compare(today(getLocalTimeZone())) > 0) {
    errors.push({ field: 'completedAt', reason: InvoiceRefundInvalidReason.CompletedAtInFuture })
  }

  if (method === null) {
    errors.push({ field: 'method', reason: InvoiceRefundInvalidReason.MethodRequired })
  }

  return errors.length > 0 ? errors : null
}

export const convertInvoiceRefundFormToParams = (form: InvoiceRefundForm): unknown => ({
  amount: convertBigDecimalToCents(form.amount),
  method: form.method,
  completedAt: form.completedAt?.toDate(),
})
