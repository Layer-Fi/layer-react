import { type Invoice } from '@schemas/invoices/invoice'

import { asDraft, invoiceFromUpsertRequest } from '@msw/api/businesses/[business-id]/invoices/invoiceFromUpsertRequest'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

export const post = createMockEndpoint<Invoice, ReturnType<typeof toInvoiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices',
  resolve: createStoreCreateResolver({
    store: invoiceStore,
    // A newly created invoice is a draft until it's finalized.
    makeBase: id => asDraft(makeInvoice({ id })),
    fromRequest: invoiceFromUpsertRequest,
    toResponse: toInvoiceResponse,
  }),
})
