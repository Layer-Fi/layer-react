import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import type { UnifiedReportControlParams } from '@providers/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'

type GetUnifiedReportExcelParams = {
  businessId: string
  route: string
} & UnifiedReportControlParams & QueryParams

const UnifiedReportExcelReturnSchema = UnwrappedDataResponseSchema(S3PresignedUrlSchema)

const getUnifiedReportExcel = getWithQuery<
  typeof UnifiedReportExcelReturnSchema.Encoded,
  GetUnifiedReportExcelParams
>(
  ['businessId', 'route'],
  ({ businessId, route }) => `/v1/businesses/${businessId}/reports/unified/${route}/exports/excel`,
)

const requestUnifiedReportExcel = getAsMutation(getUnifiedReportExcel)

export const useGetUnifiedReportExcel = createMutationHook({
  tags: ['#unified-report-excel'],
  request: requestUnifiedReportExcel,
  keyParams: ['route'],
  argToBody: (_arg: undefined) => undefined,
  schema: UnifiedReportExcelReturnSchema,
  swrOptions: { throwOnError: false },
})
