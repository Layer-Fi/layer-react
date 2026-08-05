import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import type { UnifiedReportControlParams } from '@schemas/features/unifiedReports/reportParams'
import { getAsMutation } from '@utils/shared/api/getAsMutation'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { type QueryParams } from '@utils/shared/request/toDefinedSearchParameters'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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
