import { Schema } from 'effect'

import { type Invoice, InvoiceSchema } from '@schemas/invoices/invoice'
import { InvoicePaymentMethodsSchema } from '@schemas/invoices/invoicePaymentMethod'

import { invoicePaymentMethodsStore } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/store'
import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeInvoice } from '@fixtures/invoices/mocks'

// Mirrors FinalizeInvoiceBodySchema/FinalizeInvoiceResponseSchema from
// useFinalizeInvoice without importing the hook module into the mock layer.
const FinalizeInvoiceBodySchema = Schema.extend(
  InvoicePaymentMethodsSchema,
  Schema.Struct({
    customPaymentInstructions: Schema.optional(Schema.String).pipe(
      Schema.fromKey('custom_payment_instructions'),
    ),
  }),
)

const FinalizeInvoiceResponseSchema = Schema.extend(
  InvoicePaymentMethodsSchema,
  Schema.Struct({
    invoice: InvoiceSchema,
  }),
)

const decodeFinalizeBody = Schema.decodeUnknownSync(FinalizeInvoiceBodySchema)
const encodeFinalizeResponse = Schema.encodeSync(FinalizeInvoiceResponseSchema)

export const put = createMockEndpoint<Invoice, ReturnType<typeof apiData>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/finalize-invoice',
  resolve: async ({ override, request, params }) => {
    const invoiceId = params.invoiceId as string
    const body = decodeFinalizeBody(await readRequestJson(request))

    if (override) {
      return apiData(encodeFinalizeResponse({ paymentMethods: body.paymentMethods, invoice: override }))
    }

    invoicePaymentMethodsStore.save({ id: invoiceId, paymentMethods: body.paymentMethods })

    const invoice = invoiceStore.patchById(invoiceId, invoice => ({
      ...invoice,
      customPaymentInstructions: body.customPaymentInstructions ?? invoice.customPaymentInstructions,
      updatedAt: new Date(),
    })) ?? makeInvoice({ id: invoiceId })

    return apiData(encodeFinalizeResponse({ paymentMethods: body.paymentMethods, invoice }))
  },
})
