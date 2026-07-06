import { InvoicePaymentMethodsResponseSchema } from '@schemas/invoices/invoicePaymentMethod'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

export const useInvoicePaymentMethodsGlobalCacheActions =
  createResourceGlobalCacheActions<typeof InvoicePaymentMethodsResponseSchema.Type>(INVOICE_PAYMENT_METHODS_TAG_KEY)

const getInvoicePaymentMethods = get<
  typeof InvoicePaymentMethodsResponseSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

export const useInvoicePaymentMethods = createQueryHook({
  tags: [INVOICE_PAYMENT_METHODS_TAG_KEY],
  request: getInvoicePaymentMethods,
  schema: InvoicePaymentMethodsResponseSchema,
})

export function usePreloadInvoicePaymentMethods(props: Parameters<typeof useInvoicePaymentMethods>[0]) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePaymentMethods(props)
}
