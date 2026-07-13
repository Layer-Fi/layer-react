import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

export const post = createMockEndpoint<Invoice, ReturnType<typeof toInvoiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/reset',
  resolve: createStoreTransformResolver({
    store: invoiceStore,
    makeBase: id => makeInvoice({ id }),
    toResponse: toInvoiceResponse,
    idParam: 'invoiceId',
    transform: invoice => ({
      ...invoice,
      status: InvoiceStatus.Saved,
      voidedAt: null,
      paidAt: null,
      outstandingBalance: invoice.totalAmount,
      updatedAt: new Date(),
    }),
  }),
})
