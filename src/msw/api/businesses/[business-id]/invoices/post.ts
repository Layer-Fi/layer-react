import { Schema } from 'effect'

import { type Invoice, InvoiceSchema } from '@schemas/invoices/invoice'

import { invoiceFromUpsertRequest } from '@msw/api/businesses/[business-id]/invoices/invoiceFromUpsertRequest'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

const encodeInvoice = Schema.encodeSync(InvoiceSchema)

const toCreateInvoiceResponse = (invoice: Invoice) => apiData(encodeInvoice(invoice))

export const post = createMockEndpoint<Invoice, ReturnType<typeof toCreateInvoiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices',
  resolve: createStoreCreateResolver({
    store: invoiceStore,
    makeBase: id => makeInvoice({ id }),
    fromRequest: invoiceFromUpsertRequest,
    toResponse: toCreateInvoiceResponse,
  }),
})
