import { useCallback } from 'react'
import useSWR, { type SWRResponse } from 'swr'

import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { getText } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const INVOICE_PREVIEW_TAG_KEY = '#invoices-preview'

class InvoicePreviewSWRResponse {
  private swrResponse: SWRResponse<string>

  constructor(swrResponse: SWRResponse<string>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      tags: [INVOICE_PREVIEW_TAG_KEY],
    } as const
  }
}

const getInvoicePreview = getText<{ businessId: string, invoiceId: string }>(
  ({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/html`,
)

type UseInvoicePreviewProps = {
  invoiceId: string
}
export function useInvoicePreview({ invoiceId }: UseInvoicePreviewProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    ({ accessToken, apiUrl, businessId, invoiceId }) => getInvoicePreview(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
      },
    )(),
  )

  return new InvoicePreviewSWRResponse(response)
}

export const useInvoicePreviewCacheActions = () => {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadInvoicePreview = useCallback(
    () => forceReload(
      ({ tags }) => tags.includes(INVOICE_PREVIEW_TAG_KEY),
    ),
    [forceReload],
  )

  return { forceReloadInvoicePreview }
}

export function usePreloadInvoicePreview(props: UseInvoicePreviewProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePreview(props)
}
