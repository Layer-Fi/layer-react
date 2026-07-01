import { Schema } from 'effect'
import useSWR from 'swr'

import { type InvoiceSummaryStatsResponse, InvoiceSummaryStatsResponseSchema } from '@schemas/invoices/invoice'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const INVOICE_SUMMARY_STATS_TAG_KEY = '#invoices-summary-stats'

const buildKey = createBuildKey<{ businessId: string }>([INVOICE_SUMMARY_STATS_TAG_KEY])

const getInvoiceSummaryStats = get<
  { data: InvoiceSummaryStatsResponse },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices/summary-stats`)

export function useInvoiceSummaryStats() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
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

export const useInvoiceSummaryStatsCacheActions = createResourceGlobalCacheActions<InvoiceSummaryStatsResponse>(INVOICE_SUMMARY_STATS_TAG_KEY)
