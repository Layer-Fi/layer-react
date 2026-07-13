import { Schema } from 'effect'

import { type InvoicePayment, InvoicePaymentSchema, type UpsertDedicatedInvoicePayment } from '@schemas/invoices/invoicePayment'

import { apiData } from '@msw/utils/apiResponse'

const encodePayment = Schema.encodeSync(InvoicePaymentSchema)

export const toPaymentResponse = (payment: InvoicePayment) => apiData(encodePayment(payment))

export const paymentFromUpsertBody = (body: UpsertDedicatedInvoicePayment): InvoicePayment => ({
  amount: body.amount,
  method: body.method,
  at: body.paidAt,
  referenceNumber: body.referenceNumber ?? null,
  memo: body.memo ?? null,
})
