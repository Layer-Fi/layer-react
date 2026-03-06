import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { get } from '@utils/api/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type InvoiceSummaryStatsResponse, InvoiceSummaryStatsResponseSchema } from '@features/invoices/invoiceSchemas'

export const INVOICE_SUMMARY_STATS_TAG_KEY = '#invoices-summary-stats'

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

  return new SWRQueryResult(response)
}

export const useInvoiceSummaryStatsCacheActions = () => {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadInvoiceSummaryStats = useCallback(
    () => forceReload(
      ({ tags }) => tags.includes(INVOICE_SUMMARY_STATS_TAG_KEY),
    ),
    [forceReload],
  )

  return { forceReloadInvoiceSummaryStats }
}
