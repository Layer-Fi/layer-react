import { useCallback } from 'react'
import useSWR from 'swr'

import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { getText } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const INVOICE_PREVIEW_TAG_KEY = '#invoices-preview'

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

  return new SWRQueryResult(response)
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
