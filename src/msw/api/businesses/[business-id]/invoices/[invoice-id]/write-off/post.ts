import { Schema } from 'effect'

import { InvoiceStatus } from '@schemas/invoices/invoice'
import { CreateInvoiceWriteoffSchema, type InvoiceWriteoff, InvoiceWriteoffMode, InvoiceWriteoffSchema } from '@schemas/invoices/invoiceWriteoff'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeInvoice } from '@fixtures/invoices/mocks'

const decodeCreateWriteoff = Schema.decodeUnknownSync(CreateInvoiceWriteoffSchema)
const encodeWriteoff = Schema.encodeSync(InvoiceWriteoffSchema)

const toWriteoffResponse = (writeoff: InvoiceWriteoff) => apiData(encodeWriteoff(writeoff))

export const post = createMockEndpoint<InvoiceWriteoff, ReturnType<typeof toWriteoffResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/write-off',
  resolve: async ({ override, request, params }) => {
    if (override) return toWriteoffResponse(override)

    const invoiceId = params.invoiceId as string
    const body = decodeCreateWriteoff(await readRequestJson(request))
    const invoice = invoiceStore.findById(invoiceId) ?? makeInvoice({ id: invoiceId })

    invoiceStore.save({
      ...invoice,
      status: invoice.status === InvoiceStatus.PartiallyPaid
        ? InvoiceStatus.PartiallyWrittenOff
        : InvoiceStatus.WrittenOff,
      outstandingBalance: 0,
      updatedAt: new Date(),
    })

    return toWriteoffResponse({
      invoiceId,
      externalId: body.externalId ?? null,
      amount: body.amount,
      writeOffMode: body.writeOffMode ?? InvoiceWriteoffMode.Expense,
      writeOffAt: body.writeOffAt,
      referenceNumber: body.referenceNumber ?? null,
      memo: body.memo ?? null,
    })
  },
})
