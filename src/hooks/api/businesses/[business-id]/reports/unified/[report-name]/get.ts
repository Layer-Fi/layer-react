import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { type UnifiedReportControlParams, useUnifiedReportParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'

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

const useUnifiedReportQuery = createQueryHook({
  tags: ['#unified-report'],
  request: getUnifiedReport,
  schema: UnifiedReportResponseSchema,
})

export function useUnifiedReport() {
  const params = useUnifiedReportParams()

  return useUnifiedReportQuery({
    ...params,
    route: params?.route ?? '',
    isEnabled: params !== null,
  })
}
