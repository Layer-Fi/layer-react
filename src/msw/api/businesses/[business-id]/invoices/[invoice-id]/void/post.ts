import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/toInvoiceResponse'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

export const post = createMockEndpoint<Invoice, ReturnType<typeof toInvoiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/void',
  resolve: createStoreTransformResolver({
    store: invoiceStore,
    makeBase: id => makeInvoice({ id }),
    toResponse: toInvoiceResponse,
    idParam: 'invoiceId',
    transform: invoice => ({
      ...invoice,
      status: InvoiceStatus.Voided,
      voidedAt: new Date(),
      paidAt: null,
      outstandingBalance: 0,
      updatedAt: new Date(),
    }),
  }),
})
