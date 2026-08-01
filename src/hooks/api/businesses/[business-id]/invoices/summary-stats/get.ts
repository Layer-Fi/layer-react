import { type InvoiceSummaryStatsResponse, InvoiceSummaryStatsResponseSchema } from '@schemas/invoices/invoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const INVOICE_SUMMARY_STATS_TAG_KEY = '#invoices-summary-stats'

const InvoiceSummaryStatsReturnSchema = UnwrappedDataResponseSchema(InvoiceSummaryStatsResponseSchema)

const getInvoiceSummaryStats = get<
  typeof InvoiceSummaryStatsReturnSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices/summary-stats`)

export const useInvoiceSummaryStats = createQueryHook({
  tags: [INVOICE_SUMMARY_STATS_TAG_KEY],
  request: getInvoiceSummaryStats,
  schema: InvoiceSummaryStatsReturnSchema,
})

export const useInvoiceSummaryStatsCacheActions = createResourceGlobalCacheActions<InvoiceSummaryStatsResponse>(INVOICE_SUMMARY_STATS_TAG_KEY)
