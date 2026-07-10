import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { invoiceFromUpsertRequest } from '@msw/api/businesses/[business-id]/invoices/invoiceFromUpsertRequest'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { toInvoiceResponse } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeInvoice } from '@fixtures/invoices/mocks'

const resolveCreate = createStoreCreateResolver({
  store: invoiceStore,
  makeBase: id => makeInvoice({ id }),
  fromRequest: invoiceFromUpsertRequest,
  toResponse: toInvoiceResponse,
})

export const post = createMockEndpoint<Invoice, ReturnType<typeof toInvoiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices',
  // A newly created invoice is a draft until it's finalized - not yet sent,
  // with no dates, matching the seeded draft fixtures' invariants.
  resolve: async (context) => {
    const response = await resolveCreate(context)

    const created = invoiceStore.patchById(response.data.id, invoice => ({
      ...invoice,
      status: InvoiceStatus.Draft,
      sentAt: null,
      dueAt: null,
      paidAt: null,
      voidedAt: null,
    }))

    return created ? toInvoiceResponse(created) : response
  },
})
