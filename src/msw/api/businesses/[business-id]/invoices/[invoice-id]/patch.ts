import { type Invoice } from '@schemas/invoices/invoice'

import { invoiceFromUpsertRequest } from '@msw/api/businesses/[business-id]/invoices/invoiceFromUpsertRequest'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

export const patch = createMockEndpoint<Invoice, ReturnType<typeof toInvoiceResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId',
  resolve: createStoreUpdateResolver({
    store: invoiceStore,
    makeBase: id => makeInvoice({ id }),
    fromRequest: invoiceFromUpsertRequest,
    toResponse: toInvoiceResponse,
    idParam: 'invoiceId',
  }),
})
