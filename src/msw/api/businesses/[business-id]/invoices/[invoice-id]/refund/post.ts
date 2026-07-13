import { Schema } from 'effect'

import { CreateCustomerRefundSchema, type CustomerRefund, CustomerRefundSchema, CustomerRefundStatus } from '@schemas/invoices/customerRefund'
import { InvoiceStatus } from '@schemas/invoices/invoice'

import { findOrSeedInvoice, invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeCreateRefund = Schema.decodeUnknownSync(CreateCustomerRefundSchema)
const encodeRefund = Schema.encodeSync(CustomerRefundSchema)

const toRefundResponse = (refund: CustomerRefund) => apiData(encodeRefund(refund))

export const post = createMockEndpoint<CustomerRefund, ReturnType<typeof toRefundResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/refund',
  resolve: async ({ override, request, params }) => {
    if (override) return toRefundResponse(override)

    const invoiceId = params.invoiceId as string
    const body = decodeCreateRefund(await readRequestJson(request))
    const invoice = findOrSeedInvoice(invoiceId)

    invoiceStore.save({
      ...invoice,
      status: InvoiceStatus.Refunded,
      outstandingBalance: 0,
      updatedAt: new Date(),
    })

    return toRefundResponse({
      externalId: body.externalId,
      refundedAmount: body.refundedAmount ?? invoice.totalAmount - invoice.outstandingBalance,
      status: CustomerRefundStatus.Paid,
      completedAt: body.completedAt,
      isDedicated: true,
      referenceNumber: body.referenceNumber ?? null,
      memo: body.memo ?? null,
    })
  },
})
