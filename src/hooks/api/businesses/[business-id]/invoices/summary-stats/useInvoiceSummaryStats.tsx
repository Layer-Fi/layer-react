import { Schema } from 'effect'

import { type InvoiceSummaryStatsResponse, InvoiceSummaryStatsResponseSchema } from '@schemas/invoices/invoice'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const INVOICE_SUMMARY_STATS_TAG_KEY = '#invoices-summary-stats'

const InvoiceSummaryStatsReturnSchema = Schema.Struct({
  data: InvoiceSummaryStatsResponseSchema,
})

const getInvoiceSummaryStats = get<
  typeof InvoiceSummaryStatsReturnSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices/summary-stats`)

export const useInvoiceSummaryStats = createQueryHook({
  tags: [INVOICE_SUMMARY_STATS_TAG_KEY],
  request: getInvoiceSummaryStats,
  schema: InvoiceSummaryStatsReturnSchema.pipe(Schema.pluck('data')),
})

export const useInvoiceSummaryStatsCacheActions = createResourceGlobalCacheActions<InvoiceSummaryStatsResponse>(INVOICE_SUMMARY_STATS_TAG_KEY)
