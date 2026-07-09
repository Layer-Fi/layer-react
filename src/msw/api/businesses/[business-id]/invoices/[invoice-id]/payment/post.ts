import { Schema } from 'effect'

import { InvoiceStatus } from '@schemas/invoices/invoice'
import { type InvoicePayment, UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'

import { paymentFromUpsertBody, toPaymentResponse } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment/toPaymentResponse'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeInvoice } from '@fixtures/invoices/mocks'

const decodeUpsertPayment = Schema.decodeUnknownSync(UpsertDedicatedInvoicePaymentSchema)

export const post = createMockEndpoint<InvoicePayment, ReturnType<typeof toPaymentResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/payment',
  resolve: async ({ override, request, params }) => {
    if (override) return toPaymentResponse(override)

    const body = decodeUpsertPayment(await readRequestJson(request))

    // Seed a fallback if the invoice isn't in the store, so the applied payment
    // is always reflected in the invoice the UI reads back.
    const invoice = invoiceStore.findById(params.invoiceId as string) ?? makeInvoice({ id: params.invoiceId as string })
    const outstandingBalance = Math.max(0, invoice.outstandingBalance - body.amount)

    invoiceStore.save({
      ...invoice,
      outstandingBalance,
      status: outstandingBalance === 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid,
      paidAt: outstandingBalance === 0 ? body.paidAt : invoice.paidAt,
      updatedAt: new Date(),
    })

    return toPaymentResponse(paymentFromUpsertBody(body))
  },
})
