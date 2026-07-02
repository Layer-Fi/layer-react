import useSWR from 'swr'

import { getText } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const INVOICE_PREVIEW_TAG_KEY = '#invoices-preview'

const buildKey = createBuildKey<{ businessId: string, invoiceId: string }>([INVOICE_PREVIEW_TAG_KEY])

const getInvoicePreview = getText<{ businessId: string, invoiceId: string }>(
  ({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/html`,
)

type UseInvoicePreviewProps = {
  invoiceId: string
}
export function useInvoicePreview({ invoiceId }: UseInvoicePreviewProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      invoiceId,
    })),
    ({ accessToken, apiUrl, businessId, invoiceId }) => getInvoicePreview(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
      },
    )(),
  )

  return new SWRQueryResult(response)
}

export function usePreloadInvoicePreview(props: UseInvoicePreviewProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePreview(props)
}
