import { getText } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const INVOICE_PREVIEW_TAG_KEY = '#invoices-preview'

const getInvoicePreview = getText<{ businessId: string, invoiceId: string }>(
  ({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/html`,
)

type UseInvoicePreviewProps = {
  invoiceId: string
}

export const useInvoicePreview = createQueryHook({
  tags: [INVOICE_PREVIEW_TAG_KEY],
  request: getInvoicePreview,
})

export function usePreloadInvoicePreview(props: UseInvoicePreviewProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePreview(props)
}
