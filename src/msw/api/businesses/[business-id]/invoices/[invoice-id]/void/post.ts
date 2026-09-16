import { type Invoice } from '@schemas/features/invoices/invoice'
import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'

import { makeInvoice } from '@fixtures/invoices/mocks'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'

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
