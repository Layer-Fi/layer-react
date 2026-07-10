import { addDays } from 'date-fns'
import { Schema } from 'effect'

import { FinalizeInvoiceBodySchema, FinalizeInvoiceDataSchema } from '@schemas/invoices/finalizeInvoice'
import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { invoicePaymentMethodsStore } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/store'
import { findOrSeedInvoice, invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { DEFAULT_INVOICE_PAYMENT_TERMS_DAYS } from '@fixtures/invoices/constants'

const decodeFinalizeBody = Schema.decodeUnknownSync(FinalizeInvoiceBodySchema)
const encodeFinalizeData = Schema.encodeSync(FinalizeInvoiceDataSchema)

export const put = createMockEndpoint<Invoice, ReturnType<typeof apiData>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/finalize-invoice',
  resolve: async ({ override, request, params }) => {
    const invoiceId = params.invoiceId as string
    const body = decodeFinalizeBody(await readRequestJson(request))

    if (override) {
      return apiData(encodeFinalizeData({ paymentMethods: body.paymentMethods, invoice: override }))
    }

    invoicePaymentMethodsStore.save({ id: invoiceId, paymentMethods: body.paymentMethods })

    // Finalizing sends the draft: promote it to a sent invoice with a sent
    // date, and default a due date (seeded drafts keep dueAt null).
    const stored = findOrSeedInvoice(invoiceId)
    const sentAt = new Date()
    const invoice: Invoice = {
      ...stored,
      status: InvoiceStatus.Saved,
      sentAt,
      dueAt: stored.dueAt ?? addDays(sentAt, DEFAULT_INVOICE_PAYMENT_TERMS_DAYS),
      customPaymentInstructions: body.customPaymentInstructions ?? null,
      updatedAt: new Date(),
    }
    invoiceStore.save(invoice)

    return apiData(encodeFinalizeData({ paymentMethods: body.paymentMethods, invoice }))
  },
})
