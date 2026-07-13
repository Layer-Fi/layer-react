import { Schema } from 'effect'

import { type InvoicePaymentMethod, InvoicePaymentMethodsSchema } from '@schemas/invoices/invoicePaymentMethod'

import { DEFAULT_INVOICE_PAYMENT_METHODS, invoicePaymentMethodsStore } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePaymentMethods = Schema.encodeSync(InvoicePaymentMethodsSchema)

export const get = createMockEndpoint<readonly InvoicePaymentMethod[], ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/payment-methods',
  resolve: ({ override, params }) =>
    apiData(encodePaymentMethods({
      paymentMethods: override
        ?? invoicePaymentMethodsStore.findById(params.invoiceId as string)?.paymentMethods
        ?? DEFAULT_INVOICE_PAYMENT_METHODS,
    })),
})
