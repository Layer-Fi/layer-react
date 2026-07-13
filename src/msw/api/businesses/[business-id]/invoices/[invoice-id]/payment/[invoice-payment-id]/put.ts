import { Schema } from 'effect'

import { type InvoicePayment, UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'

import { paymentFromUpsertBody, toPaymentResponse } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment/toPaymentResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeUpsertPayment = Schema.decodeUnknownSync(UpsertDedicatedInvoicePaymentSchema)

/*
 * Payments aren't stored individually, so an update can't be replayed against
 * the invoice's balance - it just echoes the edited payment back.
 */
export const put = createMockEndpoint<InvoicePayment, ReturnType<typeof toPaymentResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/payment/:invoicePaymentId',
  resolve: async ({ override, request }) => {
    if (override) return toPaymentResponse(override)

    return toPaymentResponse(paymentFromUpsertBody(decodeUpsertPayment(await readRequestJson(request))))
  },
})
