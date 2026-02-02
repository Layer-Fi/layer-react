import { put } from '@api/layer/authenticated_http'

import {
  type InvoicePaymentMethodsResponse,
  type InvoicePaymentMethodType,
} from './useInvoicePaymentMethods'

type UpdateInvoicePaymentMethodsBody = {
  payment_methods: InvoicePaymentMethodType[]
}

export const updateInvoicePaymentMethods = put<
  InvoicePaymentMethodsResponse,
  UpdateInvoicePaymentMethodsBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)
