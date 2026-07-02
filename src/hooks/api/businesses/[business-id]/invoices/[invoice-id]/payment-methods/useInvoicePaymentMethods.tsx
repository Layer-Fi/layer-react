import { InvoicePaymentMethodsResponseSchema } from '@schemas/invoices/invoicePaymentMethod'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

const getInvoicePaymentMethods = get<
  typeof InvoicePaymentMethodsResponseSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

const useInvoicePaymentMethodsQuery = createQueryHook({
  tags: [INVOICE_PAYMENT_METHODS_TAG_KEY],
  request: getInvoicePaymentMethods,
  schema: InvoicePaymentMethodsResponseSchema,
})

interface UseInvoicePaymentMethodsProps {
  invoiceId: string
  isEnabled?: boolean
}

export function useInvoicePaymentMethods({
  invoiceId,
  isEnabled = true,
}: UseInvoicePaymentMethodsProps) {
  return useInvoicePaymentMethodsQuery({
    invoiceId,
    isEnabled: isEnabled && Boolean(invoiceId),
  })
}

export function usePreloadInvoicePaymentMethods(props: UseInvoicePaymentMethodsProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePaymentMethods(props)
}
