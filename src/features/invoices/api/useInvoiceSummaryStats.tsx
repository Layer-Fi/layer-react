import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { get } from '@api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect'
import { InvoiceSummaryStatsResponseSchema, type InvoiceSummaryStatsResponse } from '@features/invoices/invoiceSchemas'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useCallback } from 'react'

export const INVOICE_SUMMARY_STATS_TAG_KEY = '#invoices-summary-stats'

class InvoiceSummaryStatsSWRResponse {
  private swrResponse: SWRResponse<InvoiceSummaryStatsResponse>

  constructor(swrResponse: SWRResponse<InvoiceSummaryStatsResponse>) {
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
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [INVOICE_SUMMARY_STATS_TAG_KEY],
    } as const
  }
}

const getInvoiceSummaryStats = get<
  { data: InvoiceSummaryStatsResponse },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices/summary-stats`)

export function useInvoiceSummaryStats() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getInvoiceSummaryStats(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(InvoiceSummaryStatsResponseSchema)(data)),
  )

  return new InvoiceSummaryStatsSWRResponse(response)
}

export const useInvoiceSummaryStatsCacheActions = () => {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadInvoiceSummaryStats = useCallback(
    () => forceReload(
      tags => tags.includes(INVOICE_SUMMARY_STATS_TAG_KEY),
    ),
    [forceReload],
  )

  return { forceReloadInvoiceSummaryStats }
}
