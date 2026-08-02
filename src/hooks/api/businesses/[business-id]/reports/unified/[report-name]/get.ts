import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import type { UnifiedReportControlParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'

type GetUnifiedReportParams = {
  businessId: string
  route: string
} & UnifiedReportControlParams & QueryParams

const UnifiedReportResponseSchema = UnwrappedDataResponseSchema(UnifiedReportSchema)

const getUnifiedReport = getWithQuery<
  typeof UnifiedReportResponseSchema.Encoded,
  GetUnifiedReportParams
>(
  ['businessId', 'route'],
  ({ businessId, route }) => `/v1/businesses/${businessId}/reports/unified/${route}`,
)

export const useGetUnifiedReport = createQueryHook({
  tags: ['#unified-report'],
  request: getUnifiedReport,
  schema: UnifiedReportResponseSchema,
})
